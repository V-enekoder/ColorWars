import { GameState, RulesOptions } from "@/utils/enums.ts";
import { Player } from "./agent.ts";

export interface GameConfig {
  rows: number;
  cols: number;
  mode: string;
  criticalPoints: number;
  players: Player[];
  rule: RulesOptions;
}

export interface CellData {
  points: number;
  player: number;
}

export interface GameResult {
  status: GameState;
  winnerId: number | null;
}

export interface Turn {
  initialPlayerId: number;
  activePlayers: number[];
  cellChanges: Map<number, CellData>;
  gameResult: GameResult;
  roundNumber: number;
  turnHash: bigint;
}
