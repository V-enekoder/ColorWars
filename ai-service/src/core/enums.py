from enum import Enum


class AgentStrategy(str, Enum):
    RANDOM = "random"
    MINIMAX = "minimax"
    MONTE_CARLO = "mcts"
    PPO = "ppo"
    GENETIC = "genetic"
    HEURISTIC = "heuristic"
    NEURAL_NETWORK = "neural_network"


class EngineType(str, Enum):
    MOCK = "mock"
    PYTHON_NAIVE = "python_naive"
    PYTHON_OPTIMIZED = "python_optimized"  # nUmpy + numba
    RUST_NAIVE = "rust_naive"
    RUST_BITBOARD = "rust_bitboard"


class RuleOptions(str, Enum):
    EMPTY_AND_OWN_ORBS = "EmptyAndOwnOrbs"
    ONLY_OWN_ORB = "OnlyOwnOrbs"


class EvaluationRules(str, Enum):
    GREEDY = "greddy"


class GameStatus(str, Enum):
    PLAYING = "playing"
    DRAW = "draw"
    WIN = "win"
