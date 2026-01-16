from pydantic import BaseModel


class Player(BaseModel):
    id: int
    active: bool


class CellData(BaseModel):
    points: int
    player: int
