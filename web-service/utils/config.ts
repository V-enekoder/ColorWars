import { RulesOptions, AgentType } from "@/utils/enums.ts";
import { GameConfig } from "@/utils/types/game.ts";

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
      { id: 1, name: "Victor", type: AgentType.HUMAN },
      { id: 2, name: "Random Bot", type: AgentType.RandomAI },
    ],
  };
};
