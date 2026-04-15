import {
  assertEquals,
  assertNotEquals,
} from "https://deno.land/std/assert/mod.ts";
import { GameEngine } from "../core/GameLogic.ts";
import { GameState, RulesOptions } from "../utils/types.ts";

Deno.test("Undo after Win: restores game state and eliminated players", () => {
  console.log("\n   🧪 Testing Undo logic after a Victory state...");

  const engine = new GameEngine(3, 3, 2, 2, RulesOptions.EmptyAndOwnOrbs);
  const eng = engine as any;

  let movesCount = 0;
  const maxMoves = 100;

  while (
    engine.gameResult.status === GameState.Playing && movesCount < maxMoves
  ) {
    const currentPlayer = engine.currentPlayerId;
    const legalMoves = engine.getLegalMoves(currentPlayer);

    if (legalMoves.length === 0) break;

    const move = legalMoves[0];
    const gen = engine.playGenerator(engine.getIndex(move.row, move.col));
    while (!gen.next().done);

    movesCount++;
  }

  assertEquals(
    engine.gameResult.status,
    GameState.Win,
    "The test should reach a WIN state to proceed",
  );

  const winner = engine.gameResult.winnerId;
  const winningHash = engine.currentHash;

  console.log(
    `   🏆 Player ${winner} won. Active players in engine: ${eng.activePlayerIds.length}`,
  );
  assertEquals(
    eng.activePlayerIds.length,
    1,
    "There should be only 1 active player ID at Win",
  );

  console.log("   ⏪ Performing Undo of the winning move...");
  engine.undoLastMove();

  assertEquals(
    engine.gameResult.status,
    GameState.Playing,
    "Status should return to PLAYING after undo",
  );

  assertEquals(
    eng.activePlayerIds.length,
    2,
    "Both players should be active again in the internal list",
  );

  const cellCounts = engine.getCellsByPlayer();
  const playersWithCells = cellCounts.filter(([_, count]) => count > 0);

  assertEquals(
    playersWithCells.length,
    2,
    "Both players should have orbs on the board again",
  );

  assertNotEquals(
    engine.currentHash,
    winningHash,
    "The hash must be different from the winning hash",
  );

  console.log("   ✅ Success: Undo after Win restored everything perfectly.");
});
