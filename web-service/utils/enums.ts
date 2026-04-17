export enum EngineType {
  PYTHON_NAIVE = "python_naive",
  PYTHON_OPTIMIZED = "python_optimized",
  PYTHON_RUST = "python_rust",
  RUST_NAIVE = "rust_naive",
  RUST_BITBOARD = "rust_bitboard",
}

export enum AgentStrategy {
  NONE = "none",
  RANDOM = "random",
  MINIMAX = "minimax",
  MONTE_CARLO = "mcts",
  PPO = "ppo",
  GENETIC = "genetic",
  HEURISTIC = "heuristic",
  NEURAL_NETWORK = "neural_network",
}

export enum AgentType {
  HUMAN = "human",
  BOT = "bot",
}

export enum GameState {
  Playing = "playing",
  Draw = "draw",
  Win = "win",
}
export enum GameMode {
  HumanVsHuman = "JvsJ",
  HumanVsIA = "JvsIA",
  IAvsIA = "IAvsIA",
}

export enum RulesOptions {
  EmptyAndOwnOrbs = "EmptyAndOwnOrbs",
  OnlyOwnOrbs = "OnlyOwnOrbs",
}
