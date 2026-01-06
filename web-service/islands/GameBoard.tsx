import { Signal, signal, useComputed, useSignal } from "@preact/signals";
import { useCallback, useEffect, useMemo, useRef } from "preact/hooks";
import { Cell } from "../components/Cell.tsx";
import { PlayerScoreboard } from "../components/PlayerScoreboard.tsx";
import { RandomBot } from "../core/AI.ts";
import { CellData, GameEngine } from "../core/GameLogic.ts";
import { PLAYER_COLOR_MAP } from "../utils/constans.ts";
import { AgentType, GameConfig, GameMode, Player } from "../utils/types.ts";
import { AgentRegistry } from "../core/agents/AgentFactory.ts";

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

export default function GameBoard({ config }: { config: GameConfig }) {
  const { mode, rows, cols, criticalPoints, players, rule } = config;

  const engine = useMemo(() => {
    return new GameEngine(rows, cols, criticalPoints, players.length, rule);
  }, [rows, cols, criticalPoints, players.length]);

  const boardSignals: Signal<CellData>[] = useMemo(() => {
    const initialBoard = engine.getBoard();
    return initialBoard.map((cellData) => signal(cellData));
  }, [engine]);

  const currentPlayerId = useSignal(engine.currentPlayerId);
  const winner = useSignal(0);
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
      if (isAnimating.value || engine.winner !== 0) return;

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

          if (engine.winner !== 0) break;

          const dynamicDelay = Math.max(30, 150 - steps * 5);
          await delay(dynamicDelay);
          if (!isMounted.current) return;
          next = generator.next();
        }
      } finally {
        if (isMounted.current) {
          currentPlayerId.value = engine.currentPlayerId;
          winner.value = engine.winner;
          isAnimating.value = false;
        }
      }
    },
    [engine, updateUI],
  );

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    if (winner.value !== 0 || isAnimating.value) return;

    const currentPlayerIdx = engine.currentPlayerId - 1;
    const playerConfig = players[currentPlayerIdx];

    const runAI = async () => {
      const agent = AgentRegistry[playerConfig.type];

      if (agent) {
        await delay(500);
        if (!isMounted.current) return;

        const move = await agent.getMove(engine);

        if (move && isMounted.current) {
          await handleCellClick(move.index);
        }
      }
    };

    runAI();
  }, [currentPlayerId.value, isAnimating.value]);

  const message = useComputed(() => {
    return winner.value !== 0
      ? `¡Ganó el jugador ${winner.value}!`
      : `Turno: Jugador ${currentPlayerId.value}`;
  });

  const playerMap = useMemo(() => {
    return players.reduce((acc, p) => {
      acc[p.id] = p;
      return acc;
    }, {} as Record<number, Player>);
  }, [players]);

  const sortedScores = useComputed(() => {
    return [...playerCounts.value]
      .filter(([id]) => id !== 0)
      .sort((a, b) => b[1] - a[1]);
  });

  return (
    <div class="flex flex-col items-center gap-4 p-4 min-h-screen bg-white">
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
              limit={engine.critical_points}
            />
          );
        })}
      </div>
    </div>
  );
}
