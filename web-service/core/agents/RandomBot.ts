import { IGameAgent } from "../../utils/types.ts";
import { GameEngine } from "../GameLogic.ts";

export class RandomBot implements IGameAgent {
  async getMove(engine: GameEngine) {
    const validMoves = engine.getLegalMoves(engine.currentPlayerId);
    if (validMoves.length === 0) return null;
    const randomIdx = validMoves[Math.floor(Math.random() * validMoves.length)];
    return { index: randomIdx };
  }
}
