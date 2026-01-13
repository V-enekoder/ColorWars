import { AgentStrategy } from "./types.ts";

export enum PlayerColor {
  Red = "#ef4444", // Rojo vibrante
  Blue = "#3b82f6", // Azul brillante
  Green = "#22c55e", // Verde esmeralda
  Yellow = "#eab308", // Amarillo dorado
  Purple = "#a855f7", // Morado intenso
  Orange = "#f97316", // Naranja energético
  Pink = "#ec4899", // Rosa fucsia
  Cyan = "#06b6d4", // Cian/Turquesa
  White = "#ffffff", // Blanco
  Gray = "#94a3b8", //Gris
}

export const PLAYER_COLOR_MAP: string[] = [
  PlayerColor.White, // Player 0 (Vacío)
  PlayerColor.Red, // Player 1
  PlayerColor.Blue, // Player 2
  PlayerColor.Green, // Player 3
  PlayerColor.Yellow, // Player 4
  PlayerColor.Purple, // Player 5
  PlayerColor.Orange, // Player 6
  PlayerColor.Pink, // Player 7
  PlayerColor.Cyan, // Player 8
];

export type AgentType = "human" | AgentStrategy;

export const AGENT_DESCRIPTIONS: Record<AgentType, string> = {
  human: "Direct control. You make every strategic decision.",
  [AgentStrategy.RANDOM]:
    "Chaos factor. Moves unpredictably without a specific pattern.",
  [AgentStrategy.MINIMAX]:
    "Deep thinker. Analyzes multiple turns ahead to find the optimal move.",
  [AgentStrategy.MINIMAX_ALPHA_BETA]:
    "Optimized deep thinker. Uses pruning to search deeper and faster.",
  [AgentStrategy.MONTE_CARLO]:
    "Statistically driven. Simulates thousands of games to find the best path.",
  [AgentStrategy.PPO]:
    "Reinforcement learning. Trained through proximal policy optimization.",
  [AgentStrategy.GENETIC]:
    "Evolutionary approach. Evolves populations of moves over generations.",
  [AgentStrategy.HEURISTIC]:
    "Tactical scout. Prioritizes cell capture and rapid expansion.",
  [AgentStrategy.NEURAL_NETWORK]:
    "Adaptive learner. Utilizes trained patterns to dominate the board.",
};

export const AGENT_LABELS: Record<AgentType, string> = {
  human: "Human Player",
  [AgentStrategy.RANDOM]: "Random AI",
  [AgentStrategy.MINIMAX]: "Minimax AI",
  [AgentStrategy.MINIMAX_ALPHA_BETA]: "Minimax (Alpha-Beta)",
  [AgentStrategy.MONTE_CARLO]: "MCTS Bot",
  [AgentStrategy.PPO]: "PPO Agent (RL)",
  [AgentStrategy.GENETIC]: "Genetic Algorithm",
  [AgentStrategy.HEURISTIC]: "Heuristic AI",
  [AgentStrategy.NEURAL_NETWORK]: "Neural Network",
};

export const AGENT_TYPES_LIST: AgentType[] = [
  "human",
  ...Object.values(AgentStrategy),
];
