import { MainMenuOption } from "./navigation.ts";
import { GameEngine } from "../core/GameLogic.ts";

export interface IGameAgent {
  getMove(engine: GameEngine): Promise<{ index: number } | null>;
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
  Human = "Human",
  RandomAI = "Random",
  MinimaxAI = "Minimax",
  HeuristicAI = "Heuristic",
  NeuralNetwork = "Neural NetWork",
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
