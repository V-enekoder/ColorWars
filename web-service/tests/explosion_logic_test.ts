import { assertEquals } from "https://deno.land/std/assert/mod.ts";
import { GameEngine } from "../core/GameLogic.ts";
import { RulesOptions } from "@/utils/enums.ts";

Deno.test(
  "Explosion: orbs distribute and capture enemy cells correctly",
  () => {
    const engine = new GameEngine(3, 3, 2, 2, RulesOptions.EmptyAndOwnOrbs);

    const p1_start = engine.getIndex(0, 0);
    const p2_start = engine.getIndex(2, 2);
    const target_idx = engine.getIndex(1, 1);
    const enemy_idx = engine.getIndex(1, 2);

    const gen1 = engine.playGenerator(p1_start);
    while (!gen1.next().done);

    const gen2 = engine.playGenerator(p2_start);
    while (!gen2.next().done);

    const gen3 = engine.playGenerator(target_idx);
    while (!gen3.next().done);

    const gen4 = engine.playGenerator(enemy_idx);
    while (!gen4.next().done);

    const gen5 = engine.playGenerator(target_idx);
    while (!gen5.next().done);

    const finalBoard = engine.getBoard();

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
  },
);
