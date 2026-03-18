import time
from abc import ABC, abstractmethod
from typing import Any

from src.core.types import GameConfig, GameState, Move, CellData


class IGameEngine(ABC):
    """
    Interface to represent the tables and game logic
    """

    def __init__(self, config: GameConfig):
        pass

    @abstractmethod
    def set_state(self, state:GameState) -> None:
        pass

    @abstractmethod
    def get_legal_moves(self, player: int) -> list[Move]:
        pass

    @abstractmethod
    def apply_move(self, index: int) -> None:
        pass

    @abstractmethod
    def get_winner(self) -> int:
        pass
    @abstractmethod
    def evaluate_position(self, player_id: int) -> float:
        pass

    @abstractmethod
    def get_board(self) -> list[CellData]:
        pass

    @abstractmethod
    def get_current_player_id(self) -> int:
        pass
    @abstractmethod
    def debug_state(self) -> None:
        pass

    @property
    @abstractmethod
    def rows(self) -> int:
        pass

    @property
    @abstractmethod
    def cols(self) -> int:
        pass

class Agent(ABC):
    """
    Abstract class for agents
    """

    def __init__(self, player_id: int, name: str):
        self.player_id = player_id
        self.name = name

    def select_move(self, engine: IGameEngine) -> Move:
        start_time: float = time.time()

        move = self._calculate_move(engine)

        end_time: float = time.time()
        move.time_ms = (end_time - start_time) * 1000

        return move

    @abstractmethod
    def _calculate_move(self, engine: IGameEngine) -> Move:
        pass
