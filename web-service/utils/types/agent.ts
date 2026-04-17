import { GameEngine } from "@/core/GameLogic.ts";
import { AgentStrategy, AgentType, EngineType } from "@/utils/enums.ts";

export interface IGameAgent {
  initRemoteEngine(engine: GameEngine): Promise<{ status: string } | null>;
  getMove(engine: GameEngine): Promise<{ index: number } | null>;
}

export interface BotConfig {
  //Un bot viene definido tanto por su estrategia como por su engine. agregar engine
  engine: EngineType;
  depth?: number;
  temperature?: number;
}

export interface Player {
  id: number;
  name: string;
  type: AgentType;
  strategy: AgentStrategy;
}
