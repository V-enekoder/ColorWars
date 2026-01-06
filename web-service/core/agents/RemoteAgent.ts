import { BotConfig, IGameAgent } from "../../utils/types.ts";
import { GameEngine } from "../GameLogic.ts";

export class RemoteAgent implements IGameAgent {
  private botId: string;
  private config: BotConfig;

  constructor(botId: string, config: BotConfig) {
    this.botId = botId;
    this.config = config;
  }

  async getMove(engine: GameEngine) {
    try {
      const response = await fetch("http://localhost:8000/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          board: engine.getBoard(),
          player_id: engine.currentPlayerId,

          algorithm_id: this.botId,

          config: {
            engine: this.config.engineType,
            depth: this.config.depth,
          },
        }),
      });

      const data = await response.json();
      return { index: data.index };
    } catch (e) {
      console.error("Error AI:", e);
      throw e;
    }
  }
}
