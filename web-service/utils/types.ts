export interface GameConfig {
  rows: number;
  cols: number;
  mode: string;
  criticalPoints: number;
  players: Player[];
  rule: RulesOptions;
}

export interface Player {
  id: number;
  name: string;
  type: AgentType;
}

export enum AgentType {
  Human = "human",
  RandomAI = "random",
  MinimaxAI = "minimax",
  HeuristicAI = "heuristic",
  NeuralNetwork = "nn",
}

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

export enum GameState {
  Playing = "playing",
  Paused = "paused",
  GameOver = "gameover",
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
