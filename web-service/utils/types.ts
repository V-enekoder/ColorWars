import { MainMenuOption } from "./navigation.ts";
import { GameEngine } from "../core/GameLogic.ts";

export interface IGameAgent {
  getMove(engine: GameEngine): Promise<{ index: number } | null>;
}

export enum EngineType {
  PYTHON_NAIVE = "python_naive",
  PYTHON_OPTIMIZED = "python_optimized",
  PYTHON_RUST = "python_rust",
  RUST_NAIVE = "rust_naive",
  RUST_BITBOARD = "rust_bitboard",
}

export interface BotConfig {
  engine: EngineType;
  depth?: number;
  temperature?: number;
}

export type CardColor = "blue" | "indigo" | "red" | "emerald" | "slate";

export interface GameConfig {
  rows: number;
  cols: number;
  mode: string;
  criticalPoints: number;
  players: Player[];
  rule: RulesOptions;
}

export enum AgentStrategy {
  NONE = "none",
  RANDOM = "random",
  MINIMAX = "minimax",
  MINIMAX_ALPHA_BETA = "minimax_alpha_beta",
  MONTE_CARLO = "mcts",
  PPO = "ppo",
  GENETIC = "genetic",
  HEURISTIC = "heuristic",
  NEURAL_NETWORK = "neural_network",
}

export interface Player {
  id: number;
  name: string;
  type: AgentType;
  strategy: AgentStrategy;
}

export enum AgentType {
  HUMAN = "human",
  BOT = "bot",
}

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

export interface SectionOption {
  id: MainMenuOption;
  title: string;
  description: string;
  link: string;
  color: CardColor;
}
