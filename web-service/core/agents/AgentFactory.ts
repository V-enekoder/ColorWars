import {
  AgentStrategy,
  BotConfig,
  EngineType,
  IGameAgent,
} from "../../utils/types.ts";
import { RemoteAgent } from "../agents/RemoteAgent.ts";

export type AgentType = "human" | AgentStrategy;

export class AgentFactory {
  static create(
    type: AgentType,
    config: Partial<BotConfig> = {},
  ): IGameAgent | null {
    const finalConfig: BotConfig = {
      engine: config.engine || EngineType.PYTHON_NAIVE,
      depth: config.depth || 4,
      ...config,
    };

    if (Object.values(AgentStrategy).includes(type as AgentStrategy)) {
      return new RemoteAgent(type as AgentStrategy, finalConfig);
    }

    throw new Error(`Estrategia de agente no soportada: ${type}`);
  }
}
