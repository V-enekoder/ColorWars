import {
  assertEquals,
  assertNotEquals,
} from "https://deno.land/std/assert/mod.ts";
import { GameEngine } from "../core/GameLogic.ts";
import { GameState, RulesOptions } from "../utils/types.ts";

Deno.test("Undo after Win: restores game state and eliminated players", () => {
  console.log("\n   🧪 Testing Undo logic after a Victory state...");

  // 1. Setup: Tablero pequeño 3x3 y CP=2 para forzar una partida rápida
  const engine = new GameEngine(3, 3, 2, 2, RulesOptions.EmptyAndOwnOrbs);
  const eng = engine as any; // Para acceder a propiedades privadas como activePlayerIds o currentHash

  let movesCount = 0;
  const maxMoves = 100;

  // 2. Jugar automáticamente hasta que alguien gane
  while (
    engine.gameResult.status === GameState.Playing && movesCount < maxMoves
  ) {
    const currentPlayer = engine.currentPlayerId;
    const legalMoves = engine.getLegalMoves(currentPlayer);

    if (legalMoves.length === 0) break;

    // Elegimos el primer movimiento legal disponible
    const move = legalMoves[0];
    const gen = engine.playGenerator(engine.getIndex(move.row, move.col));
    while (!gen.next().done);

    movesCount++;
  }

  // Verificamos que realmente llegamos a un estado de victoria
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

  // 3. ACCIÓN: DESHACER EL MOVIMIENTO DE VICTORIA
  console.log("   ⏪ Performing Undo of the winning move...");
  engine.undoLastMove();

  // 4. VERIFICACIONES DE RESTAURACIÓN

  // A. El estado debe volver a 'playing'
  assertEquals(
    engine.gameResult.status,
    GameState.Playing,
    "Status should return to PLAYING after undo",
  );

  // B. Ambos jugadores deben estar en la lista interna de IDs activos
  assertEquals(
    eng.activePlayerIds.length,
    2,
    "Both players should be active again in the internal list",
  );

  // C. Ambos jugadores deben tener celdas (usando tu método getCellsByPlayer)
  // Recordemos que devuelve [ [id, count], [id, count] ]
  const cellCounts = engine.getCellsByPlayer();
  const playersWithCells = cellCounts.filter(([_, count]) => count > 0);

  assertEquals(
    playersWithCells.length,
    2,
    "Both players should have orbs on the board again",
  );

  // D. El hash debe haber cambiado (vuelto al anterior)
  assertNotEquals(
    engine.currentHash,
    winningHash,
    "The hash must be different from the winning hash",
  );

  console.log("   ✅ Success: Undo after Win restored everything perfectly.");
});
