import random

from src.core.interfaces import Agent, IGameEngine, Move


class RandomAgent(Agent):
    def __init__(self, player_id: int, name: str):
        super().__init__(player_id, name)

    def _calculate_move(self, engine: IGameEngine) -> Move:
        moves = engine.get_legal_moves(player=0)

        if not moves:
            return Move(row=0, col=0)

        return random.choice(moves)
