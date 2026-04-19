import random

from src.core.interfaces import Agent, IGameEngine
from src.core.types import Move


class RandomAgent(Agent):
    def set_configuration(self, optimizations) -> None:
        pass

    def __init__(self, player_id: int, name: str):
        super().__init__(player_id, name)

    def _calculate_move(self, engine: IGameEngine) -> Move:
        moves = engine.get_legal_moves(player_id=engine.current_player_id)
        if not moves:
            return Move(row=0, col=0)

        return random.choice(moves)
