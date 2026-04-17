import { assertNotEquals } from "https://deno.land/std/assert/mod.ts";
import { GameEngine } from "../core/GameLogic.ts";
import { RulesOptions, GameState } from "@/utils/enums.ts";

Deno.test(
  "Win condition: detecta correctamente cuando un jugador elimina a los demás",
  () => {
    const engine = new GameEngine(3, 3, 2, 2, RulesOptions.EmptyAndOwnOrbs);

    let movesCount = 0;
    const maxMoves = 200;

    while (
      engine.gameResult.status === GameState.Playing &&
      movesCount < maxMoves
    ) {
      const currentPlayer = engine.currentPlayerId;
      const legalMoves = engine.getLegalMoves(currentPlayer);

      if (legalMoves.length === 0) break;

      const move = legalMoves[Math.floor(Math.random() * legalMoves.length)];
      const index = engine.getIndex(move.row, move.col);

      const gen = engine.playGenerator(index);
      while (!gen.next().done);

      movesCount++;
    }

    console.log(
      `   Terminado en ${movesCount} movimientos. Estado final: ${engine.gameResult.status}`,
    );

    assertNotEquals(
      engine.gameResult.status,
      GameState.Playing,
      "El juego debería haber terminado por victoria o empate",
    );

    if (engine.gameResult.status === GameState.Win) {
      assertNotEquals(
        engine.gameResult.winnerId,
        null,
        "Si hay victoria, winnerId no puede ser null",
      );
      console.log(
        `   🏆 Ganador detectado: Jugador ${engine.gameResult.winnerId}`,
      );
    }
  },
);
