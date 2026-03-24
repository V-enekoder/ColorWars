import time
from abc import ABC, abstractmethod
from typing import Any, Protocol

from src.core.types import CellData, GameConfig, GameState, Move
from test.benchmarks.SearchStats import SearchStats


class IGameEngine(ABC):
    def __init__(self, config: GameConfig):
        pass

    @abstractmethod
    def set_state(self, state: GameState) -> None: ...

    @abstractmethod
    def get_legal_moves(self, player: int) -> list[Move]: ...

    @abstractmethod
    def apply_move(self, index: int) -> None: ...

    @abstractmethod
    def get_winner(self) -> int: ...

    @abstractmethod
    def get_board(self) -> list[CellData]: ...

    @abstractmethod
    def get_current_player_id(self) -> int: ...

    @property
    @abstractmethod
    def rows(self) -> int: ...

    @property
    @abstractmethod
    def cols(self) -> int: ...


class IEvaluatable(ABC):
    @abstractmethod
    def evaluate_position(self, player_id: int) -> float: ...


class ISavable(ABC):
    @abstractmethod
    def save_state(self) -> Any: ...
    @abstractmethod
    def restore_state(self, state: Any) -> None: ...


class IDebug(ABC):
    @abstractmethod
    def debug_state(self) -> Any: ...


class EngineMinimax(Protocol):
    def get_legal_moves(self, player: int) -> list[Move]: ...
    def apply_move(self, index: int) -> None: ...
    def get_board(self) -> list[CellData]: ...
    def get_current_player_id(self) -> int: ...
    def get_winner(self) -> int: ...
    def set_state(self, state: GameState) -> None: ...

    def evaluate_position(self, player_id: int) -> float: ...

    def save_state(self) -> Any: ...
    def restore_state(self, state: Any) -> None: ...

    @property
    def rows(self) -> int: ...
    @property
    def cols(self) -> int: ...


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
