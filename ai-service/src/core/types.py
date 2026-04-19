from pydantic import BaseModel, ConfigDict

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
    model_config = ConfigDict(from_attributes=True)
    row: int
    col: int
    time_ms: float | None = None
    player: int | None = None


class GameState(BaseModel):
    board: list[CellData]
    player_id: int
    round_number: int
    legal_moves: list[Move]
    active_player_ids: list[int]


class GameResult(BaseModel):
    status: GameStatus
    winner_id: int | None = None


class Turn(BaseModel):
    initial_player_id: int
    active_players: list[int]
    cell_changes: dict[int, CellData]
    game_result: GameResult
    round_number: int
    turn_hash: int
