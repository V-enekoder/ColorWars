import { assertEquals } from "https://deno.land/std/assert/mod.ts";
import { GameEngine } from "../core/GameLogic.ts";
import { RulesOptions } from "../utils/types.ts";

Deno.test("Hash integrity: Reversibility passed 100 moves", () => {
  const engine = new GameEngine(5, 5, 3, 2, RulesOptions.EmptyAndOwnOrbs);
  const initialHash = engine.currentHash;
  const history: number[] = [];

  for (let i = 0; i < 100; i++) {
    const moves = engine.getLegalMoves(engine.currentPlayerId);
    if (moves.length === 0) break;
    const move = moves[0];
    const idx = engine.getIndex(move.row, move.col);
    history.push(idx);
    const gen = engine.playGenerator(idx);
    while (!gen.next().done);
  }

  for (let i = 0; i < history.length; i++) {
    engine.undoLastMove();
  }

  assertEquals(
    engine.currentHash,
    initialHash,
    "The final hash is different from original hash",
  );
});
