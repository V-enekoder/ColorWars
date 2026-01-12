from typing import List, Optional

from pydantic import BaseModel


class GameStateDTO(BaseModel):
    """
    El formato universal del tablero que envía Deno.
    """

    rows: int
    cols: int
    player_turn: int
    cells: List[int]  # Lista plana para eficiencia


class Move(BaseModel):
    row: int
    col: int
    player: Optional[int] = None
