import { AgentType, GameConfig, RulesOptions } from "./types.ts";

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
