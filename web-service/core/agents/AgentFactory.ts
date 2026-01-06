import { AgentType, IGameAgent } from "../../utils/types.ts";
import { RandomBot } from "./RandomBot.ts";

export const AgentRegistry: Record<AgentType, IGameAgent> = {
  [AgentType.Human]: null as any,
  [AgentType.RandomAI]: new RandomBot(),
  [AgentType.MinimaxAI]: null as any,
  [AgentType.HeuristicAI]: null as any,
  [AgentType.NeuralNetwork]: null as any,
};
