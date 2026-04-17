import { assertEquals } from "https://deno.land/std/assert/mod.ts";
import { GameEngine } from "../core/GameLogic.ts";
import { RulesOptions } from "@/utils/enums.ts";

Deno.test("Rules: prevents playing on enemy cells", () => {
  const engine = new GameEngine(5, 5, 3, 2, RulesOptions.OnlyOwnOrbs);

  const p1_move = engine.getIndex(0, 0);
  const p2_move = engine.getIndex(1, 1);

  // Player 1 plays
  const gen1 = engine.playGenerator(p1_move);
  while (!gen1.next().done);

  // Player 2 tries to play where Player 1 is
  const legalMovesP2 = engine.getLegalMoves(2);
  const isP1CellInP2Moves = legalMovesP2.some(
    (m) => engine.getIndex(m.row, m.col) === p1_move,
  );

  assertEquals(
    isP1CellInP2Moves,
    false,
    "Player 2 should not be able to play on Player 1's cell",
  );
});
