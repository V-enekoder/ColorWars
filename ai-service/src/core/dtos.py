from enum import Enum

from pydantic import BaseModel

from src.core.enums import AgentStrategy, EngineType
from src.core.types import GameConfig, GameState


class MinimaxOptimizations(str, Enum):
    VANILLA = "vanilla"
    ALPHA_BETA_PRUNING = "alpha_beta_pruning"
    TRANSITION_TABLE = "transition_table"
    NULL_MOVE = "null_move"


"""
class MinimaxOptimizations(BaseModel):
    alpha_beta_pruning: bool = False
    transposition_table: bool = False
    null_move_pruning: bool = False
    alpha_beta_pruning: bool = False  # Group 1
    move_ordering: bool = False  # Group 1
    transposition_table: bool = False  # Group 2
    quiescence_search: bool = False  # Group 2
    killer_heuristics: bool = False  # Group 3
    principal_variation_search: bool = False  # Group3
    aspiration_windows: bool = False  # Group 3
    history_heuristics: bool = False  # Group 3
    null_move_pruning: bool = False  # Group 3
    late_move_reduction: bool = False  # Group 3
"""


class AgentPolicy(BaseModel):
    engine: EngineType
    strategy: AgentStrategy
    optimizations: MinimaxOptimizations | None = None


class PredictRequest(BaseModel):
    game_config: GameConfig
    game_state: GameState
    agent_policy: AgentPolicy
