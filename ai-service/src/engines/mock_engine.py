from typing import List

from src.core.dtos import PredictRequest
from src.core.interfaces import IGameEngine, Move


class MockEngine(IGameEngine):
    def __init__(self, request: PredictRequest):
        self._board = request.board
        self._current_player = request.player_id
        self._legal_moves = request.legal_moves
        self._winner: int = -1

    def set_state(self, state) -> None:
        pass

    def get_legal_moves(self, player: int) -> List[Move]:
        return self._legal_moves

    def apply_move(self, move: Move) -> None:
        print(f"MockEngine: I play on {move}")

    def get_winner(self) -> int:
        return self._winner
