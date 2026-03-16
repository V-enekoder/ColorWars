from typing import List

from src.core.dtos import PredictRequest
from src.core.interfaces import IGameEngine, Move
from src.core.types import GameConfig


class MockEngine(IGameEngine):
    def __init__(self, config: GameConfig):
        self.rows = config.rows
        self.cols = config.cols
        self.critical_points = config.critical_points
        self.num_players = config.num_players

    def set_state(self, request: PredictRequest) -> None:
        self._board = request.board
        self._current_player = request.player_id
        self._legal_moves = request.legal_moves
        self._winner: int = -1

    def get_legal_moves(self, player: int) -> list[Move]:
        return self._legal_moves

    def apply_move(self, index: int) -> None:
        return

    def get_winner(self) -> int:
        return self._winner
