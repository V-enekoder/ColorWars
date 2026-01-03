import { useSignal, useComputed, signal, Signal } from "@preact/signals";
import { useMemo } from "preact/hooks";
import { Cell } from "../components/Cell.tsx";
import { GameEngine, CellData } from "../core/GameLogic.ts";
import { RandomBot } from "../core/AI.ts";
import { useCallback, useEffect, useRef } from "preact/hooks";
import {
  GameConfig,
  GameMode,
  AgentType,
  PLAYER_COLOR_MAP,
} from "../utils/types.ts";

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

export default function GameBoard({ config }: { config: GameConfig }) {
  const { mode, rows, cols, criticalPoints, players } = config;

  const engine = useMemo(() => {
    return new GameEngine(rows, cols, criticalPoints, players.length);
  }, [rows, cols, criticalPoints, players.length]);

  const boardSignals: Signal<CellData>[] = useMemo(() => {
    const initialBoard = engine.getBoard();
    return initialBoard.map((cellData) => signal(cellData));
  }, [engine]);

  const currentPlayerId = useSignal(engine.getCurrentPlayerId());
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
          sig.value = { ...newCell };
        }
      });
      playerCounts.value = engine.getCellsByPlayer();
    },
    [engine, boardSignals, playerCounts],
  );

  const handleCellClick = useCallback(
    async (row: number, col: number) => {
      if (isAnimating.value || engine.winner !== 0) return;

      const generator = engine.playGenerator(row, col);

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
          currentPlayerId.value = engine.getCurrentPlayerId();
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

    const currentPlayerIdx = engine.getCurrentPlayerId() - 1;
    const playerConfig = players[currentPlayerIdx];

    const runAI = async () => {
      if (playerConfig?.type === AgentType.RandomAI) {
        if (mode === GameMode.IAvsIA || mode === GameMode.HumanVsIA) {
          await delay(600 * 0);
        }

        if (!isMounted.current) return;

        const move = RandomBot.getMove(engine);
        if (move) {
          await handleCellClick(move.r, move.c);
        }
      }
    };

    runAI();
  }, [
    currentPlayerId.value,
    isAnimating.value,
    engine,
    mode,
    players,
    handleCellClick,
  ]);

  const message = useComputed(() => {
    return winner.value !== 0
      ? `¡Ganó el jugador ${winner.value}!`
      : `Turno: Jugador ${currentPlayerId.value}`;
  });

  return (
    <div class="flex flex-col items-center gap-4 p-4 min-h-screen bg-white">
      <h2 class="text-3xl font-extrabold text-slate-800 tracking-tight mb-2">
        {message}
      </h2>

      <div class="flex flex-wrap justify-center gap-6 mb-8">
        {[...playerCounts.value]
          .filter(([id]) => id !== 0)
          .sort((a, b) => b[1] - a[1])
          .map(([playerId, count]) => {
            const playerInfo = players.find((p) => p.id === playerId);
            const playerName = playerInfo
              ? playerInfo.name
              : `Jugador ${playerId}`;
            const color = PLAYER_COLOR_MAP[playerId] || "#cbd5e1";
            const isActive = playerId === currentPlayerId.value;

            return (
              <div
                key={playerId}
                class={`
                  relative flex items-center gap-4 px-6 py-3 rounded-2xl border-2
                  font-bold transition-all duration-500 transform
                  ${isActive ? "scale-110 z-10 shadow-lg" : "scale-100 opacity-40"}
                `}
                style={{
                  borderColor: color,
                  backgroundColor: `${color}${isActive ? "20" : "05"}`,
                  color: color,
                }}
              >
                <div class="text-xl">
                  {playerInfo?.type === "bot" ? "🤖" : "👤"}
                </div>
                <span class="text-lg flex flex-col leading-tight">
                  <span class="text-[10px] uppercase tracking-widest opacity-60">
                    {playerInfo?.type === "bot" ? "Sistema IA" : "Humano"}
                  </span>
                  <span class="truncate max-w-[100px]">{playerName}</span>
                </span>
                <div class="text-3xl ml-2 font-black">{count}</div>
              </div>
            );
          })}
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${cols}, min-content)`,
          gap: "0.4rem",
        }}
      >
        {boardSignals.map((cellSignal, index) => {
          const rowIndex = Math.floor(index / cols);
          const colIndex = index % cols;
          const cellData = cellSignal.value;
          const limit = engine.critical_points;
          const isCritical = cellData.points === limit - 1;

          return (
            <Cell
              key={`${rowIndex}-${colIndex}`}
              row={rowIndex}
              column={colIndex}
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
