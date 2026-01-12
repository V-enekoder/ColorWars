from typing import List, Optional

from pydantic import BaseModel


class GameStateDTO(BaseModel):
    """
    El formato universal del tablero que envía Deno.
    """

    rows: int
    cols: int
    player_turn: int
    cells: List[int]


class Move(BaseModel):
    row: int
    col: int
    player: Optional[int] = None


class BotConfig(BaseModel):
    engine: str
    depth: int | None = None
    temperature: int | None = None


class CellData(BaseModel):
    points: int
    player: int


class PredictRequest(BaseModel):
    board: list[CellData]
    player_id: int
    algorithm_id: str
    config: BotConfig
