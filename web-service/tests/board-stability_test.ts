import { assertEquals } from "https://deno.land/std/assert/mod.ts";
import { GameEngine } from "../core/GameLogic.ts";
import { RulesOptions } from "@/utils/enums.ts";

Deno.test("board stability: no cell with critical points", () => {
  const engine = new GameEngine(5, 5, 3, 2, RulesOptions.EmptyAndOwnOrbs);
  for (let i = 0; i < 50; i++) {
    const moves = engine.getLegalMoves(engine.currentPlayerId);
    if (moves.length === 0) break;
    const move = moves[0];
    const gen = engine.playGenerator(engine.getIndex(move.row, move.col));
    while (!gen.next().done);

    engine.getBoard().forEach((cell, idx) => {
      assertEquals(cell.points < 3, true, `Cell ${idx} pass the limit`);
    });
  }
});
