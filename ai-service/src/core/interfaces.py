import time
from abc import ABC, abstractmethod
from typing import List, Tuple

from src.core.dtos import GameStateDTO, Move


class IGameEngine(ABC):
    """
    Interface to represent the tables and game logic
    """

    @abstractmethod
    def set_state(self, state: GameStateDTO) -> None:
        pass

    @abstractmethod
    def get_legal_moves(self, player: int) -> List[Move]:
        pass

    @abstractmethod
    def apply_move(self, move: Move) -> None:
        pass

    @abstractmethod
    def get_winner(self) -> int:
        pass


class Agent(ABC):
    """
    Abstract class for agents
    """

    def __init__(self, player_id: int, name: str):
        self.player_id = player_id
        self.name = name

    def select_move(self, engine: IGameEngine) -> Move:
        start_time = time.time()

        move = self._calculate_move(engine)

        end_time = time.time()
        duration_ms = (end_time - start_time) * 1000

        return move

    @abstractmethod
    def _calculate_move(self, engine: IGameEngine) -> Move:
        pass
