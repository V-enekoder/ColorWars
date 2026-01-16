import { AgentStrategy, BotConfig, IGameAgent } from "../../utils/types.ts";
import { GameEngine, Move } from "../GameLogic.ts";

export class RemoteAgent implements IGameAgent {
  private agent_strategy: AgentStrategy;
  private config: BotConfig;
  private readonly agentId: string;

  constructor(agent_strategy: AgentStrategy, config: BotConfig) {
    this.agent_strategy = agent_strategy;
    this.config = config;
    this.agentId = crypto.randomUUID();
  }
  async initRemoteEngine(
    engine: GameEngine,
  ): Promise<{ status: string } | null> {
    try {
      const response = await fetch("http://localhost:8000/init", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: this.agentId,
          rows: engine.rows,
          cols: engine.cols,
          critical_points: engine.critical_points,
          num_players: engine.getNumPlayers(),
          play_rule: engine.playRule,
          engine_type: this.config.engine,
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
      console.log(data.id);
      console.log(data.status);
      return { status: data.status };
    } catch (e) {
      console.error("Error AI:", e);
      throw e;
    }
  }

  async getMove(engine: GameEngine) {
    try {
      const currentPlayerId: number = engine.currentPlayerId;
      const legalMoves: Move[] = engine.getLegalMoves(currentPlayerId);
      const response = await fetch("http://localhost:8000/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          //id: this.agentId,
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
