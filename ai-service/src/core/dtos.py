from pydantic import BaseModel

from src.core.enums import AgentStrategy, EngineType
from src.core.types import GameConfig, GameState


class MinimaxOptimizations(BaseModel):
    alpha_beta_pruning: bool = False
    move_ordering: bool = False
    transposition_table: bool = False
    quiescence_search: bool = False
    killer_heuristics: bool = False
    principal_variation_search: bool = False
    aspiration_windows: bool = False
    history_heuristics: bool = False
    null_move_pruning: bool = False
    late_move_reduction: bool = False


class AgentPolicy(BaseModel):
    engine: EngineType
    strategy: AgentStrategy
    optimizations: MinimaxOptimizations | None = None


class PredictRequest(BaseModel):
    game_config: GameConfig
    game_state: GameState
    agent_policy: AgentPolicy
