import { AgentType } from "./types.ts";

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

export const AGENT_DESCRIPTIONS: Record<AgentType, string> = {
  [AgentType.Human]: "Direct control. You make every strategic decision.",
  [AgentType.RandomAI]:
    "Chaos factor. Moves unpredictably without a specific pattern.",
  [AgentType.MinimaxAI]:
    "Deep thinker. Analyzes multiple turns ahead to find the optimal move.",
  [AgentType.HeuristicAI]:
    "Tactical scout. Prioritizes cell capture and rapid expansion.",
  [AgentType.NeuralNetwork]:
    "Adaptive learner. Utilizes trained patterns to dominate the board.",
};

export const AGENT_TYPES_LIST = Object.values(AgentType);

export const AGENT_LABELS: Record<AgentType, string> = {
  [AgentType.Human]: "Human Player",
  [AgentType.RandomAI]: "Random Player",
  [AgentType.MinimaxAI]: "Minimax AI",
  [AgentType.HeuristicAI]: "Heusristic AI",
  [AgentType.NeuralNetwork]: "Neural Network",
};
