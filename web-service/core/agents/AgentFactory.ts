import { AgentType, BotConfig, EngineType } from "../../utils/types.ts";
import { RemoteAgent } from "../agents/RemoteAgent.ts";
import { IGameAgent } from "../../utils/types.ts";

export class AgentFactory {
  static create(
    type: AgentType,
    config: Partial<BotConfig> = {},
  ): IGameAgent | null {
    const finalConfig: BotConfig = {
      engineType: config.engineType || EngineType.PythonNaive,
      depth: config.depth || 4,
      ...config,
    };

    switch (type) {
      case AgentType.Human:
        return null;

      case AgentType.RandomAI:
        return new RemoteAgent(AgentType.RandomAI, finalConfig);

      case AgentType.MinimaxAI:
        return new RemoteAgent(AgentType.MinimaxAI, finalConfig);

      case AgentType.NeuralNetwork:
        return new RemoteAgent(AgentType.NeuralNetwork, finalConfig);

      default:
        throw new Error(`Tipo de agente desconocido: ${type}`);
    }
  }
}
