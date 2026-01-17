from collections import deque
from typing import Final, List

from src.core.dtos import CellData, PredictRequest
from src.core.enums import RuleOptions
from src.core.interfaces import IGameEngine, Move
from src.core.types import Player

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
    def __init__(self, rows: int, cols: int, critical_points: int, num_players: int, rules: RuleOptions):
        self._rows = rows
        self._cols = cols
        self._critical_points = critical_points
        self._play_rule: RuleOptions = rules

        self._current_player_index: int = 0
        self._round_number: int = 1
        self._winner: int = 0
        self._board: List[CellData] = [CellData(points=0, player=0) for _ in range(rows * cols)]
        self._players: List[Player] = [Player(id=i + 1, active=True) for i in range(num_players)]
        self._cells_by_player: dict[int, int] = {}

        for p in self._players:
            self._cells_by_player[p.id] = 0

        self._neighbors: list[list[int]] = self._calculate_neighbors(CARDINALS)
        self._fullAdjacencies: list[list[int]] = self._calculate_neighbors(ALL_DIRECTIONS)

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

    def _get_index(self, row: int, col: int) -> int:
        return row * self._cols + col

    def _get_coordinates(self, index: int) -> Move:
        row: int = index // self._cols
        col: int = index % self._cols
        return Move(row, col)

    def set_state(self, request: PredictRequest) -> None:
        self._board = request.board
        self._current_player = request.player_id
        self._legal_moves = request.legal_moves
        self.__winner: int = -1

    def _get_current_player_id(self) -> int:
        idx: int = self._current_player_index
        return self._players[idx].id

    def get_legal_moves(self, player: int) -> List[Move]:
        return self._legal_moves

    def apply_move(self, index: int) -> None:
        if self._winner != 0:
            return
        current_player: int = self._current_player_index

        if not self._is_legal_move(index, current_player):
            return

        self._add_orb(index, current_player)

        if self._round_number > 1:
            self._check_eliminations()

        self._advance_turn()

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
            neighbors_indexes = self._fullAdjacencies[index]
            for n_idx in neighbors_indexes:
                neighbor = self._board[n_idx]
                if neighbor.player != 0 and neighbor.player != current_player_idx:
                    return False
        return True

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

    def __get_points_to_add(self) -> int:
        is_first_round = self._round_number == 1

        match self._play_rule:
            case RuleOptions.ONLY_OWN_ORB:
                return self._critical_points - 1 if is_first_round else 1
            case _:
                return 1

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

    def get_winner(self) -> int:
        return self._winner

    @property
    def current_player_id(self) -> int:
        return self._players[self._current_player_index].id


"""
consideraciones:
    B. Escala de Rendimiento (Minimax)
    Si tu Minimax va a simular millones de turnos, el bucle while
    buscando jugadores activos puede ser costoso si hay muchos jugadores eliminados.

        Alternativa: Mantener una lista separada de "jugadores vivos"
        o una cola de prioridad. Así, pasar al siguiente turno es siempre una operación
        O(1)O(1)
        (directa) en lugar de o(n)

    C. Gestión de Rondas
    Ten en cuenta que tu lógica actual define "ronda" basándose en el índice 0.

        Problema potencial: Si el Jugador 1 es eliminado, la ronda seguirá
        incrementándose cuando el índice pase por su posición (aunque esté inactivo).

        Si para tu IA la "Ronda" es un factor importante en la función de evaluación
        (heurística), asegúrate de que esta definición de ronda sea la que realmente necesitas.

    D. El límite de intentos (attempts)
    En la versión de Python, si el límite de intentos se alcanza, el
    currentPlayerIndex quedará apuntando a un jugador inactivo.

        Sugerencia: Deberías considerar qué debe pasar en ese caso extremo.
        Si ocurre, probablemente es porque el juego debería haber terminado
        por falta de jugadores, y lanzar una excepción o declarar un empate
        sería más seguro que dejar que el flujo continúe.

"""
