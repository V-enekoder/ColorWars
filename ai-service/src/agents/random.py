from src.core.interfaces import Agent, IGameEngine, Move


class RandomAgent(Agent):
    def _calculate_move(self, engine: IGameEngine) -> Move:
        return Move(1, 1)
