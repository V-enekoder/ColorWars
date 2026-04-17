import { assertEquals } from "https://deno.land/std/assert/mod.ts";
import { GameEngine } from "../core/GameLogic.ts";
import { RulesOptions, GameState } from "@/utils/enums.ts";

Deno.test("Draw condition: detects draw when capture limit is reached", () => {
  console.log("\n   🧪 Testing Draw Condition (Capture Limit)...");

  const numPlayers = 2;
  const engine = new GameEngine(
    4,
    4,
    100,
    numPlayers,
    RulesOptions.EmptyAndOwnOrbs,
  );

  const expectedLimit = 50; // 25 * 2
  let movesCount = 0;

  while (engine.gameResult.status === GameState.Playing) {
    const currentPlayer = engine.currentPlayerId;
    const legalMoves = engine.getLegalMoves(currentPlayer);

    if (legalMoves.length === 0) break;

    const move = legalMoves[0];
    const index = engine.getIndex(move.row, move.col);

    const gen = engine.playGenerator(index);
    while (!gen.next().done);

    movesCount++;

    if (movesCount > 100) break;
  }

  // @ts-ignore
  const finalCounter = engine.turnsWithoutCaptures;

  console.log(`   Final Counter: ${finalCounter}`);
  console.log(`   Total Valid Moves Made: ${movesCount}`);
  console.log(`   Final Status: ${engine.gameResult.status}`);

  assertEquals(
    finalCounter,
    expectedLimit,
    "The counter should hit exactly 50",
  );
  assertEquals(
    engine.gameResult.status,
    GameState.Draw,
    "The status should be DRAW",
  );

  console.log("   ✅ Success: Draw detected after 50 peaceful moves.");
});

Deno.test("Draw condition: repetition table logic check", () => {
  const engine = new GameEngine(3, 3, 3, 2, RulesOptions.EmptyAndOwnOrbs);
  const currentHash = engine.currentHash;

  for (let i = 0; i < 3; i++) {
    // @ts-ignore
    engine.registerPosition(currentHash);
  }

  // @ts-ignore
  const result = engine.isDraw(currentHash);

  assertEquals(result, true, "Should be draw after 3 repetitions");
  console.log("   ✅ Success: Repetition logic verified.");
});
