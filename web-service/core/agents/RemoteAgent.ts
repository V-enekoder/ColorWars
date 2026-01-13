import { BotConfig, IGameAgent } from "../../utils/types.ts";
import { GameEngine, Move } from "../GameLogic.ts";

export class RemoteAgent implements IGameAgent {
  private botId: string;
  private config: BotConfig;

  constructor(botId: string, config: BotConfig) {
    this.botId = botId;
    this.config = config;
  }

  async getMove(engine: GameEngine) {
    try {
      const currentPlayerId: number = engine.currentPlayerId;
      const legalMoves: Move[] = engine.getLegalMoves(currentPlayerId);
      const response = await fetch("http://localhost:8000/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          board: engine.getBoard(),
          player_id: engine.currentPlayerId,
          legal_moves: legalMoves,
          agent_strategy: this.botId,
          config: {
            engine: this.config.engine,
            depth: this.config.depth,
          },
        }),
      });

      if (!response.ok) {
        const errorDetail = await response.json();
        console.error(
          "Detalle del error 422:",
          JSON.stringify(errorDetail, null, 2),
        );
        throw new Error("Validación fallida en el servidor");
      }

      const data = await response.json();
      const row = data.row;
      const col = data.col;
      return { index: engine.getIndex(row, col) };
    } catch (e) {
      console.error("Error AI:", e);
      throw e;
    }
  }
}
