import { AgentStrategy, BotConfig, IGameAgent } from "../../utils/types.ts";
import { GameEngine, Move } from "../GameLogic.ts";

export class RemoteAgent implements IGameAgent {
  private agent_strategy: AgentStrategy;
  private config: BotConfig;

  constructor(agent_strategy: AgentStrategy, config: BotConfig) {
    this.agent_strategy = agent_strategy;
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
          agent_strategy: this.agent_strategy,
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
