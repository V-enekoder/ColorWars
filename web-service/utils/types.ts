import { MainMenuOption } from "./navigation.ts";
import { GameEngine } from "../core/GameLogic.ts";

export interface IGameAgent {
  getMove(engine: GameEngine): Promise<{ index: number } | null>;
}

export enum EngineType {
  PythonNaive = "python_naive",
  RustBitboard = "rust_bitboard",
}

export interface BotConfig {
  engineType: EngineType;
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

export enum AgentType {
  Human = "human",
  RandomAI = "random",
  MinimaxAI = "minimax",
  HeuristicAI = "heuristic",
  NeuralNetwork = "neural_network",
}

export interface Player {
  id: number;
  name: string;
  type: AgentType;
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
