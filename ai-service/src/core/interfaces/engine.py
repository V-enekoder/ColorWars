from abc import ABC, abstractmethod

from src.core.types import CellData, GameConfig, GameResult, GameState, Move


class IGameEngine(ABC):
    def __init__(self, config: GameConfig):
        pass

    @abstractmethod
    def set_state(self, state: GameState) -> None: ...

    @abstractmethod
    def get_legal_moves(self, player_id: int) -> list[Move]: ...

    @abstractmethod
    def apply_move(self, index: int) -> None: ...

    @abstractmethod
    def get_board(self) -> list[CellData]: ...

    @property
    @abstractmethod
    def game_result(self) -> GameResult: ...

    @property
    @abstractmethod
    def current_player_id(self) -> int: ...

    @property
    @abstractmethod
    def rows(self) -> int: ...

    @property
    @abstractmethod
    def cols(self) -> int: ...
