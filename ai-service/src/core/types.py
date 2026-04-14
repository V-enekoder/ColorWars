from pydantic import BaseModel

from src.core.enums import GameStatus, RuleOptions


class Player(BaseModel):
    id: int
    active: bool


class CellData(BaseModel):
    points: int
    player: int


class GameConfig(BaseModel):
    rows: int
    cols: int
    critical_points: int
    num_players: int
    rules: RuleOptions


class Move(BaseModel):
    row: int
    col: int
    time_ms: float | None = None
    player: int | None = None

    class Config:
        frozen = True


class GameState(BaseModel):
    board: list[CellData]
    player_id: int
    round_number: int
    legal_moves: list[Move]


class GameResult(BaseModel):
    status: GameStatus
    winnerId: int | None = None
