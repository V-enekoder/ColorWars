from typing import List, Optional

from pydantic import BaseModel

from src.core.enums import AgentStrategy, EngineType


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
    time_ms: float | None = None
    player: Optional[int] = None


class BotConfig(BaseModel):
    engine: EngineType
    depth: int | None = None
    temperature: int | None = None


class CellData(BaseModel):
    points: int
    player: int


class PredictRequest(BaseModel):
    board: list[CellData]
    player_id: int
    legal_moves: list[Move]
    agent_strategy: AgentStrategy
    config: BotConfig
