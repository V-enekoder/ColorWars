import { assertEquals } from "https://deno.land/std@0.224.0/assert/assert_equals.ts";
import { GameEngine } from "../core/GameLogic.ts";
import { RulesOptions } from "@/utils/enums.ts";

Deno.test("Rules: prevents playing next to enemy in Round 1", () => {
  const engine = new GameEngine(5, 5, 3, 2, RulesOptions.EmptyAndOwnOrbs);

  // Player 1 plays at (2,2)
  const p1_idx = engine.getIndex(2, 2);
  const gen1 = engine.playGenerator(p1_idx);
  while (!gen1.next().done);

  // Player 2 tries to play at (2,3) - directly next to Player 1
  const p2_neighbor_idx = engine.getIndex(2, 3);
  const legalMovesP2 = engine.getLegalMoves(2);
  const isNeighborLegal = legalMovesP2.some(
    (m) => engine.getIndex(m.row, m.col) === p2_neighbor_idx,
  );

  assertEquals(
    isNeighborLegal,
    false,
    "Player 2 should not be allowed to play adjacent to Player 1 in Round 1",
  );
});
