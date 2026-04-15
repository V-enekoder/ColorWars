import secrets
from collections import deque
from typing import Final, override

from src.core.enums import GameStatus, RuleOptions
from src.core.interfaces import IGameEngine
from src.core.types import CellData, GameConfig, GameResult, GameState, Move, Turn

type Direction = tuple[int, int]
type DirectionList = tuple[Direction, ...]

CARDINALS: Final[DirectionList] = (
    (1, 0),
    (-1, 0),
    (0, 1),
    (0, -1),
)

DIAGONALS: Final[DirectionList] = (
    (-1, -1),
    (1, -1),
    (-1, 1),
    (1, 1),
)

ALL_DIRECTIONS: Final[DirectionList] = CARDINALS + DIAGONALS


class PythonNaive(IGameEngine):
    """
    // ==========================================
    // 1. STATE & PROPERTIES
    // ==========================================
    """

    _MAX_REPETITIONS: Final[int] = 3
    _EMPTY_PLAYER: Final[int] = 0

    def __init__(self, config: GameConfig):
        super().__init__(config)
        self._rows: int = config.rows
        self._cols: int = config.cols
        self._total_cells: int = config.rows * config.cols
        self._critical_points: int = config.critical_points
        self._play_rule: RuleOptions = config.rules
        self._total_players: int = config.num_players
        self._MAX_TURNS_WITHOUT_CAPTURES: Final[int] = 25 * config.num_players

        self._board: list[CellData] = [CellData(points=0, player=0) for _ in range(self._total_cells)]
        self._active_players_ids: list[int] = [i + 1 for i in range(self._total_players)]
        self._current_player_id: int = 1
        self._round_number: int = 1
        self._turns_without_captures: int = 0

        self._cells_by_player: dict[int, int] = {i + 1: 0 for i in range(self._total_players)}
        self._repetition_table: dict[int, int] = {}

        self._neighbors: list[list[int]] = self._calculate_neighbors(CARDINALS)
        self._full_adjacencies: list[list[int]] = self._calculate_neighbors(ALL_DIRECTIONS)

        self._zobrist_table: list[list[list[int]]] = self._init_zobrist_table()
        self._turn_randoms: list[int] = self._init_turn_hash()
        self._current_hash: int = self._init_zobrist_hash()

        self._game_result: GameResult = GameResult(status=GameStatus.PLAYING)
        self._history: list[Turn] = []
        self._current_turn: Turn | None = None

        self._legal_moves: list[Move] = []

    """
    // ==========================================
    // 2. INITIALIZATION
    // ==========================================
    """

    def _init_zobrist_table(self) -> list[list[list[int]]]:
        num_states: int = self._critical_points + 1
        num_players: int = self._total_players + 1

        return [
            [[secrets.randbits(64) for _ in range(num_players)] for _ in range(num_states)]
            for _ in range(self._total_cells)
        ]

    def _init_turn_hash(self) -> list[int]:
        return [secrets.randbits(64) for _ in range(self._total_players + 1)]

    def _init_zobrist_hash(self) -> int:
        initial_hash = 0

        for i in range(self._total_cells):
            initial_hash ^= self._zobrist_table[i][0][0]
        initial_hash ^= self._turn_randoms[self._current_player_id]

        return initial_hash

    def _init_current_turn(self) -> Turn:
        return Turn(
            initial_player_id=self.current_player_id,
            active_players=self._active_players_ids.copy(),
            cell_changes={},
            game_result=self._game_result.model_copy(),
            round_number=self._round_number,
            turn_hash=0,
        )

    """
    // ==========================================
    // 3. PUBLIC INTERFACE (API)
    // ==========================================
    """

    # --- Getters ---
    @property
    @override
    def rows(self) -> int:
        return self._rows

    @property
    @override
    def cols(self) -> int:
        return self._cols

    @property
    @override
    def current_player_id(self) -> int:
        return self._current_player_id

    @property
    def current_hash(self) -> int:
        return self._current_hash

    @property
    @override
    def game_result(self) -> GameResult:
        return self._game_result

    # --- Game Actions ---

    @override
    def set_state(self, state: GameState) -> None:
        self._board = [cell.model_copy() for cell in state.board]
        self._current_player_id = state.player_id
        self._legal_moves = list(state.legal_moves)

    def evaluate_position(self, player_id: int) -> float:
        total_cells = sum(self._cells_by_player.values())

        my_cells = self._cells_by_player.get(player_id, 0)
        return float(2 * my_cells - total_cells)

    def undo_last_move(self) -> None:
        if not self._history:
            return

        last_turn = self._history.pop()
        if not last_turn:
            return

        self._current_player_id = last_turn.initial_player_id
        self._active_players_ids = list(last_turn.active_players)
        self._game_result = last_turn.game_result.model_copy()
        self._round_number = last_turn.round_number

        for idx, data in last_turn.cell_changes.items():
            cell = self._board[idx]

            self._update_cell_hash(idx, cell.points, cell.player)

            self._set_cell_owner(cell, data.player)
            cell.points = data.points

            self._update_cell_hash(idx, cell.points, cell.player)

        self._unregister_position(last_turn.turn_hash)

        if self._history:
            self._current_hash = self._history[-1].turn_hash
        else:
            self._current_hash = self._init_zobrist_hash()

    @override
    def apply_move(self, index: int) -> None:
        if self._game_result.status != GameStatus.PLAYING:
            return

        current_player_id = self.current_player_id
        if not self._is_legal_move(index, current_player_id):
            return

        self._current_hash ^= self._turn_randoms[current_player_id]

        self._current_turn = self._init_current_turn()

        prev_captures = self._turns_without_captures
        self._add_orb(index, current_player_id)

        if self._turns_without_captures == prev_captures:
            self._turns_without_captures += 1

        if self._round_number > 2:
            self._check_eliminations()

        self._game_result = self._check_game_status()

        if self._game_result.status == GameStatus.PLAYING:
            self._advance_turn()
            self._current_hash ^= self._turn_randoms[self.current_player_id]

        self._register_position(self._current_hash)

        self._current_turn.turn_hash = self._current_hash

        self._history.append(self._current_turn)
        self._current_turn = None

    # --- Data Queries ---
    def _get_index(self, row: int, col: int) -> int:
        return row * self._cols + col

    def _get_coordinates(self, index: int) -> Move:
        row: int = index // self._cols
        col: int = index % self._cols
        return Move(row=row, col=col)

    @override
    def get_legal_moves(self, player_id: int) -> list[Move]:
        moves: list[Move] = []

        for i in range(self._total_cells):
            if self._is_legal_move(i, player_id):
                moves.append(self._get_coordinates(i))

        return moves

    @override
    def get_board(self) -> list[CellData]:
        return self._board[:]

    def get_cells_by_player(self) -> list[tuple[int, int]]:
        return sorted([(pid, count) for pid, count in self._cells_by_player.items() if pid != 0], key=lambda x: x[0])

    # ==========================================
    # 4. CORE GAME LOGIC (Add Orb & Chain Reaction)
    # ==========================================

    def _add_orb(self, cell_index: int, player_index: int) -> None:
        cell = self._board[cell_index]

        self._update_cell_hash(cell_index, cell.points, cell.player)
        self._add_cell_change(cell_index, cell.player, cell.points)

        self._set_cell_owner(cell, player_index)
        cell.points += self._get_points_to_add()

        explosion_queue: deque[int] = deque()

        if cell.points >= self._critical_points:
            cell.points = 0
            self._set_cell_owner(cell, self._EMPTY_PLAYER)
            self._update_cell_hash(cell_index, cell.points, cell.player)
            explosion_queue.append(cell_index)
        else:
            self._update_cell_hash(cell_index, cell.points, cell.player)
        exploded_in_this_chain: set[int] = set()

        while explosion_queue:
            curr_idx = explosion_queue.popleft()

            exploded_in_this_chain.add(curr_idx)

            for n_idx in self._neighbors[curr_idx]:
                if n_idx in exploded_in_this_chain:
                    continue

                did_explode = self._process_neighbor_cell(n_idx, player_index)
                if did_explode:
                    explosion_queue.append(n_idx)

            self._check_eliminations()
            if self._game_result.status != GameStatus.PLAYING:
                break

    def _process_neighbor_cell(self, n_idx: int, exploding_player: int) -> bool:
        neighbor = self._board[n_idx]

        self._update_cell_hash(n_idx, neighbor.points, neighbor.player)
        self._add_cell_change(n_idx, neighbor.player, neighbor.points)

        if neighbor.player != exploding_player:
            self._set_cell_owner(neighbor, exploding_player)

        neighbor.points += 1

        exploded = False
        if neighbor.points >= self._critical_points:
            neighbor.points = 0
            self._set_cell_owner(neighbor, self._EMPTY_PLAYER)
            exploded = True

        self._update_cell_hash(n_idx, neighbor.points, neighbor.player)
        return exploded

    def _set_cell_owner(self, cell: CellData, new_player: int) -> None:
        old_player = cell.player
        if old_player == new_player:
            return

        cell.player = new_player
        if old_player != self._EMPTY_PLAYER:
            self._update_cell_count(old_player, -1)
            self._turns_without_captures = 0
        if new_player != self._EMPTY_PLAYER:
            self._update_cell_count(new_player, 1)

    def _get_points_to_add(self) -> int:
        is_first_round: bool = self._round_number == 1

        match self._play_rule:
            case RuleOptions.ONLY_OWN_ORB:
                return self._critical_points - 1 if is_first_round else 1
            case _:
                return 1

    def _update_cell_count(self, player_id: int, change: int) -> None:
        current = self._cells_by_player.get(player_id, 0)
        self._cells_by_player[player_id] = current + change

    def _check_eliminations(self) -> None:
        if self._round_number <= 2:
            return

        self._active_players_ids = [pid for pid in self._active_players_ids if self._cells_by_player.get(pid, 0) > 0]

    # ==========================================
    # 5. TURN & GAME STATUS LOGIC
    # ==========================================
    def _advance_turn(self) -> None:
        if self._game_result.status != GameStatus.PLAYING:
            return

        next_id = self._next_player_id

        if self._is_new_round(next_id):
            self._round_number += 1

        self._current_player_id = next_id

    @property
    def _next_player_id(self) -> int:
        try:
            active_idx = self._active_players_ids.index(self._current_player_id)
        except ValueError:
            active_idx = -1

        next_active_idx = (active_idx + 1) % len(self._active_players_ids)
        return self._active_players_ids[next_active_idx]

    def _is_new_round(self, next_id: int) -> bool:
        return next_id <= self._current_player_id

    def _check_game_status(self) -> GameResult:
        if self._is_draw(self._current_hash):
            return GameResult(status=GameStatus.DRAW, winner_id=None)

        if len(self._active_players_ids) == 1:
            return GameResult(status=GameStatus.WIN, winner_id=self._active_players_ids[0])

        return GameResult(status=GameStatus.PLAYING, winner_id=None)

    def _is_draw(self, key: int) -> bool:
        count = self._repetition_table.get(key, 0)

        if count >= self._MAX_REPETITIONS:
            return True
        if self._turns_without_captures >= self._MAX_TURNS_WITHOUT_CAPTURES:
            return True

        return False

    # ==========================================
    # 6. VALIDATION HELPERS
    # ==========================================
    def _is_legal_move(self, index: int, current_player_idx: int) -> bool:
        cell: CellData = self._board[index]

        if cell.player != 0 and cell.player != current_player_idx:
            return False

        can_play_on_empty: bool = False
        can_play_on_own: bool = True

        match self._play_rule:
            case RuleOptions.ONLY_OWN_ORB:
                if self._round_number == 1:
                    can_play_on_empty = True

            case RuleOptions.EMPTY_AND_OWN_ORBS:
                can_play_on_empty = True

        is_empty = cell.player == 0
        is_owned = cell.player == current_player_idx

        if (is_empty and not can_play_on_empty) or (is_owned and not can_play_on_own):
            return False

        if self._round_number == 1 and is_empty:
            neighbors_indexes = self._full_adjacencies[index]
            for n_idx in neighbors_indexes:
                neighbor = self._board[n_idx]
                if neighbor.player != 0 and neighbor.player != current_player_idx:
                    return False
        return True

    def _calculate_neighbors(self, directions: DirectionList) -> list[list[int]]:
        neighbors: list[list[int]] = []
        for i in range(0, self._rows * self._cols):
            row: int = i // self._cols
            col: int = i % self._cols
            valid: list[int] = []

            for dx, dy in directions:
                nx: int = row + dx
                ny: int = col + dy
                if self._is_valid_coord(nx, ny):
                    valid.append(self._get_index(nx, ny))
            neighbors.append(valid)

        return neighbors

    def _is_valid_coord(self, row: int, col: int) -> bool:
        return 0 <= row < self._rows and 0 <= col < self._cols

    # ==========================================
    # 7. HASHING & REPETITION SYSTEM (Zobrist)
    # ==========================================
    def _get_hash_for_cell(self, idx: int, points: int, player: int) -> int:
        return self._zobrist_table[idx][points][player]

    def _register_position(self, key: int) -> None:
        self._repetition_table[key] = self._repetition_table.get(key, 0) + 1

    def _unregister_position(self, key: int) -> None:
        count = self._repetition_table.get(key)

        if not count:
            return

        if count == 1:
            del self._repetition_table[key]
        else:
            self._repetition_table[key] -= 1

    def _add_cell_change(self, idx: int, player: int, points: int) -> None:
        if self._current_turn and idx not in self._current_turn.cell_changes:
            self._current_turn.cell_changes[idx] = CellData(points=points, player=player)

    def _update_cell_hash(self, idx: int, points: int, player: int) -> None:
        self._current_hash ^= self._get_hash_for_cell(idx, points, player)

    # ==========================================
    # 8. DEBUG & UTILS
    # ==========================================

    def debug_state(self) -> None:
        """Imprime el estado interno del motor para debugging."""
        print("\n" + "=" * 50)
        print("🚀 DEBUG: ESTADO DEL MOTOR PYTHON_NAIVE")
        print("=" * 50)

        # 1. Datos básicos
        print(f"🔹 Jugador Actual (ID): {self._current_player_id}")
        print(f"🔹 Ronda: {self._round_number}")
        print(f"🔹 Jugadores Activos: {self._active_players_ids}")
        print(f"🔹 Conteo celdas: {self._cells_by_player}")
        print(f"🔹 Hash Actual: {hex(self._current_hash)}")

        # 2. Renderizado ASCII del tablero
        print("\nTABLERO (Formato [Jugador:Puntos]):")
        # Imprimir números de columna
        print("      " + "  ".join([f"{c:02d}" for c in range(self._cols)]))
        print("    " + "---" * (self._cols * 2))

        for r in range(self._rows):
            row_str = f"{r:02d} | "
            for c in range(self._cols):
                idx = r * self._cols + c
                cell = self._board[idx]
                # Representamos el jugador y sus puntos (. para vacío)
                p = str(cell.player) if cell.player != 0 else "."
                row_str += f"[{p}:{cell.points}] "
            print(row_str)

        print("=" * 50 + "\n")
