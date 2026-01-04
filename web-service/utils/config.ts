import { GameConfig, RulesOptions, AgentType } from "./types.ts";

export const parseGameConfig = (
  params: URLSearchParams,
  mode: string,
): GameConfig => {
  return {
    mode,
    rows: Number(params.get("rows")) || 10,
    cols: Number(params.get("cols")) || 10,
    criticalPoints: Number(params.get("cp")) || 3,
    rule: (params.get("rule") as RulesOptions) || RulesOptions.OnlyOwnOrbs,
    players: [
      { id: 1, name: "Victor", type: AgentType.Human },
      { id: 2, name: "Random Bot", type: AgentType.RandomAI },
    ],
  };
};

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
