import { GameEngine } from "./GameLogic.ts";

export class RandomBot {
  static getMove(
    engine: GameEngine,
  ): { r: number; c: number; index: number } | null {
    const validMoves: number[] = [];
    const board = engine.getBoard();
    const myId = engine.getCurrentPlayerId();
    const round = engine.getRoundNumber();

    for (let i = 0; i < board.length; i++) {
      if ((board[i].player === 0 && round === 1) || board[i].player === myId) {
        validMoves.push(i);
      }
    }

    if (validMoves.length === 0) return null;

    const randomIdx = validMoves[Math.floor(Math.random() * validMoves.length)];

    return {
      r: Math.floor(randomIdx / engine.cols),
      c: randomIdx % engine.cols,
      index: randomIdx,
    };
  }
}
