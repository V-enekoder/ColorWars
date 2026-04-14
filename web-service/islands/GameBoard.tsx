import { Signal, signal, useComputed, useSignal } from "@preact/signals";
import { useCallback, useEffect, useMemo, useRef } from "preact/hooks";
import { Cell } from "../components/Cell.tsx";
import { PlayerScoreboard } from "../components/PlayerScoreboard.tsx";
import { AgentFactory } from "../core/agents/AgentFactory.ts";
import { GameEngine } from "../core/GameLogic.ts";
import { PLAYER_COLOR_MAP } from "../utils/constans.ts";
import {
  CellData,
  GameConfig,
  GameState,
  IGameAgent,
  Player,
} from "../utils/types.ts";

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

export default function GameBoard({ config }: { config: GameConfig }) {
  const { rows, cols, criticalPoints, players, rule } = config;

  const engine = useMemo(() => {
    return new GameEngine(rows, cols, criticalPoints, players.length, rule);
  }, [rows, cols, criticalPoints, players.length]);

  const boardSignals: Signal<CellData>[] = useMemo(() => {
    const initialBoard = engine.board;
    return initialBoard.map((cellData) => signal(cellData));
  }, [engine]);

  const currentPlayerId = useSignal(engine.currentPlayerId);
  const gameResult = useSignal(engine.gameResult);

  const playerCounts = useSignal<[number, number][]>(engine.getCellsByPlayer());
  const isAnimating = useSignal(false);
  const isMounted = useRef(true);

  const updateUI = useCallback(
    (rawBoard: CellData[]) => {
      boardSignals.forEach((sig, index) => {
        const newCell = rawBoard[index];
        const currentVal = sig.value;
        if (
          currentVal.points !== newCell.points ||
          currentVal.player !== newCell.player
        ) {
          sig.value = newCell;
        }
      });
      playerCounts.value = engine.getCellsByPlayer();
    },
    [engine, boardSignals, playerCounts],
  );

  const handleCellClick = useCallback(
    async (index: number) => {
      if (isAnimating.value || engine.gameResult.status !== GameState.Playing) {
        return;
      }

      const generator = engine.playGenerator(index);

      let next = generator.next();

      if (next.done) {
        console.warn("Movimiento inválido");
        return;
      }

      isAnimating.value = true;

      try {
        let steps = 0;
        while (!next.done) {
          steps++;
          const rawBoard: CellData[] = next.value;
          updateUI(rawBoard);

          if (engine.gameResult.status !== GameState.Playing) break;
          const dynamicDelay = Math.max(30, 150 - steps * 5);
          await delay(dynamicDelay);
          if (!isMounted.current) return;
          next = generator.next();
        }
      } finally {
        if (isMounted.current) {
          currentPlayerId.value = engine.currentPlayerId;
          gameResult.value = engine.gameResult;
          isAnimating.value = false;
        }
      }
    },
    [engine, updateUI],
  );

  const handleUndoClick = useCallback(() => {
    if (isAnimating.value) {
      return;
    }

    engine.undoLastMove();

    const restoredBoard = engine.getBoard();

    updateUI(restoredBoard);

    currentPlayerId.value = engine.currentPlayerId;
    gameResult.value = engine.gameResult;

    isAnimating.value = false;

    console.log("Deshacer completado");
  }, [engine, updateUI, currentPlayerId, gameResult, isAnimating]);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const agentsMap = useMemo(() => {
    const map = new Map<number, IGameAgent>();

    players.forEach((p) => {
      const agent = AgentFactory.create(p.type, p as any);

      if (agent) {
        map.set(p.id, agent);
      }
    });

    return map;
  }, [players]);
  useEffect(() => {
    if (isAnimating.value || engine.gameResult.status !== GameState.Playing) {
      return;
    }
    const currentId = engine.currentPlayerId;
    const agent = agentsMap.get(currentId);

    if (!agent) return;

    const runAI = async () => {
      try {
        await delay(500);
        if (!isMounted.current) return;

        const move = await agent.getMove(engine);

        if (move && isMounted.current && engine.currentPlayerId === currentId) {
          await handleCellClick(move.index);
        }
      } catch (e) {
        console.error("Error en turno de IA:", e);
      }
    };

    runAI();
  }, [currentPlayerId.value, isAnimating.value]);

  const message = useComputed(() => {
    return gameResult.value.status !== GameState.Playing
      ? `¡Ganó el jugador ${engine.gameResult.winnerId}!`
      : `Turno: Jugador ${currentPlayerId.value}`;
  });

  const playerMap = useMemo(() => {
    return players.reduce(
      (acc, p) => {
        acc[p.id] = p;
        return acc;
      },
      {} as Record<number, Player>,
    );
  }, [players]);

  const sortedScores = useComputed(() => {
    return [...playerCounts.value]
      .filter(([id]) => id !== 0)
      .sort((a, b) => b[1] - a[1]);
  });

  return (
    <div class="flex flex-col items-center gap-4 ">
      <h2 class="text-3xl font-extrabold text-slate-800 tracking-tight mb-2">
        {message}
      </h2>

      <div class="flex flex-wrap justify-center gap-6 mb-8">
        {sortedScores.value.map(([playerId, count]) => (
          <PlayerScoreboard
            key={playerId}
            player={playerMap[playerId]}
            playerId={playerId}
            count={count}
            isActive={playerId === currentPlayerId.value}
            color={PLAYER_COLOR_MAP[playerId] || "#cbd5e1"}
          />
        ))}
      </div>
      <div class="flex justify-center mb-8">
        <button
          onClick={handleUndoClick}
          disabled={isAnimating.value}
          class={`
            group flex items-center gap-3 px-8 py-3 rounded-2xl font-extrabold
            transition-all duration-300 ease-out border-2
            ${
            isAnimating.value
              ? "bg-slate-50 text-slate-300 border-slate-100 cursor-not-allowed shadow-none"
              : "bg-white border-slate-200 text-slate-700 hover:border-blue-400 hover:text-blue-600 hover:shadow-xl hover:-translate-y-1 active:translate-y-0 shadow-lg shadow-slate-200/50"
          }
          `}
        >
          <span
            class={`text-xl transition-transform duration-300 ${
              !isAnimating.value && "group-hover:-translate-x-1"
            }`}
          >
            ⬅️
          </span>
          <span class="text-xs uppercase tracking-[0.2em]">
            Deshacer movimiento
          </span>
        </button>
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${cols}, min-content)`,
          gap: "0.4rem",
        }}
      >
        {boardSignals.map((cellSignal, index) => {
          const cellData = cellSignal.value;
          const limit = engine.critical_points;
          const isCritical = cellData.points === limit - 1;

          return (
            <Cell
              key={`${index}`}
              index={index}
              points={cellData.points}
              player={cellData.player}
              isCritical={isCritical}
              onClick={handleCellClick}
              limit={limit}
            />
          );
        })}
      </div>
    </div>
  );
}
