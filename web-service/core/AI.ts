import { GameEngine } from "./GameLogic.ts";

export class RandomBot {
  static getMove(
    engine: GameEngine,
  ): { index: number } | null {
    const validMoves: number[] = engine.getLegalMoves(
      engine.currentPlayerId,
    );

    const randomIdx = validMoves[Math.floor(Math.random() * validMoves.length)];

    return {
      index: randomIdx,
    };
  }
}
