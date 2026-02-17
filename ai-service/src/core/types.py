from pydantic import BaseModel

from src.core.enums import EngineType, RuleOptions


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
    engine_type: EngineType
