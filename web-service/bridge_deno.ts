import { GameEngine } from "./core/GameLogic.ts";
import { RulesOptions } from "./utils/types.ts";

/**
 * Convierte el estado del motor a un objeto plano compatible con el JSON de Python.
 */
function serializeState(engine: GameEngine) {
  const cellsByPlayerObj: Record<number, number> = {};
  engine.cellsByPlayer.forEach((value, key) => {
    cellsByPlayerObj[key] = value;
  });

  return {
    board: engine.board.map((c) => ({ points: c.points, player: c.player })),
    currentPlayerIndex: engine.currentPlayerIndex,
    roundNumber: engine.roundNumber,
    winner: engine.winner,
    cellsByPlayer: cellsByPlayerObj,
    currentPlayerId: engine.currentPlayerId, // <-- No olvides este
  };
}

async function main() {
  let engine: GameEngine | null = null;

  // Creamos un lector de línea para stdin
  const decoder = new TextDecoder();
  const buffer = Deno.stdin.readable;

  // Iteramos sobre los chunks de la entrada estándar
  for await (const chunk of buffer) {
    const text = decoder.decode(chunk);
    const lines = text.split("\n");

    for (const line of lines) {
      if (!line.trim()) continue;

      try {
        const command = JSON.parse(line);
        const action = command.action;

        if (action === "init") {
          engine = new GameEngine(
            command.rows,
            command.cols,
            command.criticalPoints,
            command.numPlayers,
            command.rules as RulesOptions,
          );
        } else if (action === "play" && engine) {
          // El playGenerator en TS es un generador, debemos agotarlo
          // para que se ejecute toda la reacción en cadena.
          const iterator = engine.playGenerator(command.index);
          let result = iterator.next();
          while (!result.done) {
            result = iterator.next();
          }
        } else if (action === "quit") {
          Deno.exit(0);
        }

        if (engine) {
          const state = serializeState(engine);
          console.log(JSON.stringify(state));
        }
      } catch (e) {
        console.error(`Error in Deno Bridge: ${e.message}`);
        console.log(JSON.stringify({ error: e.message }));
      }
    }
  }
}

main();
