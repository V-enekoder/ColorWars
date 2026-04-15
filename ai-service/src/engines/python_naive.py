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
        self._current_player_index: int = 0
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
        initial_hash ^= self._turn_randoms[self._current_player_index]

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
        return self._active_players_ids[self._current_player_index]

    # --- Game Actions ---

    def save_state(self) -> None:
        self._saved_board = self._board[:]
        self._saved_player_index = self._current_player_index
        self._saved_legal_moves = self._legal_moves

    def restore_state(self) -> None:
        self._board = self._saved_board
        self._current_player_index = self._saved_player_index
        self._legal_moves = self._saved_legal_moves

    @override
    def set_state(self, state: GameState) -> None:
        self._board = [cell.model_copy() for cell in state.board]
        self._current_player_index = state.player_id
        self._legal_moves = list(state.legal_moves)

    def evaluate_position(self, player_id: int) -> float:
        total_cells = sum(self._cells_by_player.values())

        my_cells = self._cells_by_player.get(player_id, 0)
        return float(2 * my_cells - total_cells)

    # --- Data Queries ---
    def _get_index(self, row: int, col: int) -> int:
        return row * self._cols + col

    def _get_coordinates(self, index: int) -> Move:
        row: int = index // self._cols
        col: int = index % self._cols
        return Move(row=row, col=col)

    @override
    def get_legal_moves(self, player: int) -> list[Move]:
        return self._legal_moves

    @override
    def get_board(self) -> list[CellData]:
        return self._board

    # ==========================================
    # 4. CORE GAME LOGIC (Add Orb & Chain Reaction)
    # ==========================================

    def _add_orb(self, cell_index: int, player_index: int) -> None:
        board: list[CellData] = self._board
        neighbors: list[list[int]] = self._neighbors
        points_to_add: int = self._get_points_to_add()
        critical_points: int = self._critical_points

        cell: CellData = board[cell_index]

        self._set_cell_owner(cell, player_index)

        cell.points += points_to_add  ##Se pueden añadir __slots__

        explosion_queue: deque[int] = deque([])

        if cell.points >= critical_points:
            cell.points -= critical_points
            if cell.points == 0:
                self._set_cell_owner(cell, 0)
            explosion_queue.append(cell_index)

        while len(explosion_queue) > 0:
            current_idx: int = explosion_queue.popleft()
            current_neighbors: list[int] = neighbors[current_idx]
            for n_idx in current_neighbors:
                neighbor = board[n_idx]
                if neighbor.player != player_index:
                    self._set_cell_owner(
                        neighbor, player_index
                    )  # Se puede elimianr la llamada a la funcion en un futuro y poner directamente el codigo para el overhead
                neighbor.points += 1

                if neighbor.points >= critical_points:
                    neighbor.points -= critical_points
                    if neighbor.points == 0:
                        self._set_cell_owner(neighbor, 0)
                    explosion_queue.append(n_idx)

            self._check_eliminations()
            if self._winner != 0:
                break

        return

    def _get_points_to_add(self):
        is_first_round = self._round_number == 1
        match self._play_rule:
            case RuleOptions.ONLY_OWN_ORB:
                return self._critical_points - 1 if is_first_round else 1
            case _:
                return 1

    def _set_cell_owner(self, cell: CellData, new_player_index: int) -> None:
        old_player_index: int = cell.player

        if old_player_index == new_player_index:
            return

        cell.player = new_player_index

        if old_player_index != 0:
            self._update_cell_count(old_player_index, -1)
        if new_player_index != 0:
            self._update_cell_count(new_player_index, 1)

    def _update_cell_count(self, player_id: int, change: int) -> None:
        self._cells_by_player[player_id] += change

    def _check_eliminations(self) -> None:
        active_count: int = 0
        last_active_id: int = 0

        for p in self._players:
            cell_count: int = self._cells_by_player.get(p.id) or 0
            if cell_count == 0 and p.active and self._round_number > 1:
                p.active = False
            if p.active:
                active_count += 1
                last_active_id = p.id
        if active_count == 1:
            self._winner = last_active_id

    # ==========================================
    # 5. TURN & GAME STATUS LOGIC
    # ==========================================
    def _advance_turn(self):
        if self._winner != 0:
            return

        attempts = 0
        while True:
            self._current_player_index = (self._current_player_index + 1) % len(self._players)

            if self._current_player_index == 0:
                self._round_number += 1

            attempts += 1

            if self._players[self._current_player_index].active or attempts >= len(self._players) * 2:
                break

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
            neighbors_indexes = self._full_adjacency[index]
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
    # 8. DEBUG & UTILS
    # ==========================================

    def debug_state(self) -> None:
        """Imprime el estado interno del motor para debugging."""
        print("\n" + "=" * 40)
        print("DEBUG: ESTADO DEL MOTOR PYTHON_NAIVE")
        print("=" * 40)

        # 1. Datos básicos
        print(f"Jugador Actual: {self._current_player_index}")
        print(f"Ronda: {self._round_number}")
        print(f"Jugadores Activos: {[p.id for p in self._players]}")
        print(f"Conteo celdas por jugador: {self._cells_by_player}")

        # 2. Renderizado ASCII del tablero
        print("\nTABLERO (ASCII):")
        for r in range(self._rows):
            row_str = ""
            for c in range(self._cols):
                idx = r * self._cols + c
                cell = self._board[idx]
                # Representamos el jugador y sus puntos
                row_str += f"[{cell.player if cell.player else '.'}:{cell.points:02d}] "
            print(row_str)

        # 3. Info técnica adicional
        if self._legal_moves:
            print(f"\nJugadas legales disponibles: {len(self._legal_moves)}")
        else:
            print("\nNo hay jugadas legales cargadas.")
        print("=" * 40 + "\n")
