from src.core.interfaces import Agent, IGameEngine

class MinimaxAgent(Agent):
    def _calculate_move(self, engine: IGameEngine):
        # ... lógica minimax ...
        # Fíjate que el tipo hint ayuda al IDE a saber qué métodos tiene engine
