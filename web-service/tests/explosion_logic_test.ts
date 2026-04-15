import { assertEquals } from "https://deno.land/std/assert/mod.ts";
import { GameEngine } from "../core/GameLogic.ts";
import { RulesOptions } from "../utils/types.ts";

Deno.test("Explosion: orbs distribute and capture enemy cells correctly", () => {
  // Usamos un tablero de 3x3 con límite 2
  const engine = new GameEngine(3, 3, 2, 2, RulesOptions.EmptyAndOwnOrbs);

  const p1_start = engine.getIndex(0, 0);
  const p2_start = engine.getIndex(2, 2);
  const target_idx = engine.getIndex(1, 1); // Celda que explotará
  const enemy_idx = engine.getIndex(1, 2); // Celda enemiga a capturar

  // --- RONDA 1: Movimientos legales alejados para activar el juego ---
  const gen1 = engine.playGenerator(p1_start);
  while (!gen1.next().done);

  const gen2 = engine.playGenerator(p2_start);
  while (!gen2.next().done);

  // --- RONDA 2: Ahora ya podemos jugar cerca de los enemigos ---
  // Jugador 1 prepara su celda en el centro
  const gen3 = engine.playGenerator(target_idx);
  while (!gen3.next().done);

  // Jugador 2 se coloca justo al lado
  const gen4 = engine.playGenerator(enemy_idx);
  while (!gen4.next().done);

  // --- EL MOMENTO DE LA EXPLOSIÓN ---
  // Estado actual: (1,1) tiene 1 orbe de P1. (1,2) tiene 1 orbe de P2.
  // Jugador 1 juega en (1,1) de nuevo -> Llega a 2 -> EXPLOTA
  const gen5 = engine.playGenerator(target_idx);
  while (!gen5.next().done);

  const finalBoard = engine.getBoard();

  // VERIFICACIONES:

  // 1. La celda origen (1,1) debe estar vacía tras explotar
  assertEquals(
    finalBoard[target_idx].points,
    0,
    "Origin cell should be 0 after explosion",
  );
  assertEquals(
    finalBoard[target_idx].player,
    0,
    "Origin cell should have no owner",
  );

  // 2. La celda enemiga (1,2) tenía 1 orbe. Recibió 1 de la explosión.
  // Al llegar a 2 (el límite), ¡DEBE EXPLOTAR TAMBIÉN!
  // Por lo tanto, al final de la cadena, (1,2) también debe estar vacía.
  assertEquals(
    finalBoard[enemy_idx].points,
    0,
    "Enemy neighbor should also have exploded",
  );
  assertEquals(
    finalBoard[enemy_idx].player,
    0,
    "Enemy neighbor should be empty after chain reaction",
  );

  // 3. Verificar un vecino que no llegó al límite (ej: 0,1)
  // Debería haber sido capturado por el Jugador 1 (dueño de la explosión original)
  const neighbor_idx = engine.getIndex(0, 1);
  assertEquals(
    finalBoard[neighbor_idx].player,
    1,
    "Distant neighbor should be captured by P1",
  );
  assertEquals(
    finalBoard[neighbor_idx].points,
    1,
    "Distant neighbor should have 1 orb",
  );
});
