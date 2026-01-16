import math
from typing import Final, List

from src.core.dtos import CellData, PredictRequest
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
    def __init__(self, rows: int, cols: int, critical_points: int, num_players: int):
        self._rows = rows
        self._cols = cols
        self._critical_points = critical_points
        self._current_player_index: int = 0
        self._round_number: int = 1
        self._winner: int = 0
        self._board: List[CellData] = [CellData(0, 0) for _ in range(0, rows * cols)]
        self._players: List[Player] = [Player(i + 1, True) for i in range(0, num_players)]
        self._cells_by_player: dict[int, int] = {}

        for p in self._players:
            self._cells_by_player[p.id] = 0

        self.__neighbors: list[list[int]] = self._calculate_neighbors(CARDINALS)
        self.__fullAdjacencies: list[list[int]] = self._calculate_neighbors(ALL_DIRECTIONS)

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

    def set_state(self, request: PredictRequest) -> None:
        self._board = request.board
        self._current_player = request.player_id
        self._legal_moves = request.legal_moves
        self.__winner: int = -1

    def get_legal_moves(self, player: int) -> List[Move]:
        return self._legal_moves

    def apply_move(self, move: Move) -> None:
        print(f"MockEngine: I play on {move}")

    def get_winner(self) -> int:
        return self._winner
