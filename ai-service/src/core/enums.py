from enum import Enum


class AgentStrategy(str, Enum):
    RANDOM = "random"
    MINIMAX = "minimax"
    MINIMAX_ALPHA_BETA = "minimax_alpha_beta"
    MONTE_CARLO = "mcts"
    PPO = "ppo"
    GENETIC = "genetic"
    HEURISTIC = "heuristic"
    NEURAL_NETWORK = "neural_network"


class EngineType(str, Enum):
    MOCK = "mock"
    PYTHON_NAIVE = "python_naive"
    PYTHON_OPTIMIZED = "python_optimized"
    PYTHON_RUST = "python_rust"
    RUST_NAIVE = "rust_naive"
    RUST_BITBOARD = "rust_bitboard"
