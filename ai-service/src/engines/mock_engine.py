from typing import List

from src.core.dtos import PredictRequest
from src.core.interfaces import IGameEngine, Move


class MockEngine(IGameEngine):
    def __init__(self, rows: int, cols: int, critical_points: int, num_players: int):
        self.rows = rows
        self.cols = cols
        self.critical_points = critical_points
        self.num_players = num_players

    def set_state(self, request: PredictRequest) -> None:
        self._board = request.board
        self._current_player = request.player_id
        self._legal_moves = request.legal_moves
        self._winner: int = -1

    def get_legal_moves(self, player: int) -> List[Move]:
        return self._legal_moves

    def apply_move(self, move: Move) -> None:
        print(f"MockEngine: I play on {move}")

    def get_winner(self) -> int:
        return self._winner
