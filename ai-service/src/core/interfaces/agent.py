import time
from abc import ABC, abstractmethod

from src.core.interfaces.engine import IGameEngine
from src.core.interfaces.protocols import EngineMinimax
from src.core.types import Move
from test.benchmarks.SearchStats import SearchStats


class Agent(ABC):
    """
    Abstract class for agents
    """

    def __init__(self, player_id: int, name: str | None = None):
        self.player_id = player_id
        self.name = name or self.__class__.__name__

    def select_move(self, engine: IGameEngine) -> Move:
        start_time: float = time.time()

        move = self._calculate_move(engine)

        end_time: float = time.time()
        time_ms = (end_time - start_time) * 1000
        print(f"Tarda: {time_ms:.3f}ms")
        return move

    @abstractmethod
    def _calculate_move(self, engine: IGameEngine) -> Move:
        pass

    @abstractmethod
    def set_configuration(self, optimizations) -> None: ...


class ISearcher(ABC):
    @abstractmethod
    def search(self, engine: EngineMinimax, time_limit: float, stats: SearchStats | None = None) -> Move: ...
