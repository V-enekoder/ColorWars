from pydantic import BaseModel

from src.core.enums import AgentStrategy, EngineType
from src.core.types import GameConfig, GameState


class AgentPolicy(BaseModel):
    engine: EngineType
    strategy: AgentStrategy
    depth: int | None = None
    temperature: int | None = None


class PredictRequest(BaseModel):
    game_config: GameConfig
    game_state: GameState
    agent_policy: AgentPolicy
