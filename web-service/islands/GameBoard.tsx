import { useSignal, useComputed, signal, Signal } from "@preact/signals";
import { useMemo } from "preact/hooks";
import { Cell } from "../components/Cell.tsx";
import { GameEngine, CellData } from "../core/GameLogic.ts";
import { RandomBot } from "../core/AI.ts";
import { useCallback, useEffect } from "preact/hooks";
import { GameConfig } from "../utils/types.ts";

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

export default function GameBoard({ config }: { config: GameConfig }) {
  const { mode, rows, cols, criticalPoints, num_players } = config;

  const engine = useMemo(() => {
    return new GameEngine(rows, cols, criticalPoints, num_players);
  }, [rows, cols, criticalPoints, num_players]);

  const boardSignals: Signal<CellData>[] = useMemo(() => {
    const initialBoard = engine.getBoard();
    return initialBoard.map((cellData) => signal(cellData));
  }, [engine]);

  const currentPlayerId = useSignal(engine.getCurrentPlayerId());
  const winner = useSignal(0);
  const playerCounts = useSignal<[number, number][]>(engine.getCellsByPlayer());
  const isAnimating = useSignal(false);

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
          const rawBoard = next.value;
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

          const dynamicDelay = Math.max(30, 150 - steps * 5);
          await delay(dynamicDelay);

          next = generator.next();
        }
      } finally {
        currentPlayerId.value = engine.getCurrentPlayerId();
        winner.value = engine.winner;
        isAnimating.value = false;
      }
    },
    [engine],
  );

  useEffect(() => {
    if (
      engine.getCurrentPlayerId() === 2 &&
      !isAnimating.value &&
      mode === "JvsIA"
    ) {
      const move = RandomBot.getMove(engine);
      if (move) handleCellClick(move.r, move.c);
    }
  }, [currentPlayerId.value, isAnimating.value]);

  const message = useComputed(() => {
    return winner.value !== 0
      ? `¡Ganó el jugador ${winner.value}!`
      : `Turno: Jugador ${currentPlayerId.value}`;
  });

  return (
    <div class="flex flex-col items-center gap-4 p-4">
      <h2 class="text-2xl font-bold">{message}</h2>

      <div class="flex gap-4 mb-4">
        {playerCounts.value
          .filter(([id]) => id !== 0)
          .sort((a, b) => a[0] - b[0])
          .map(([playerId, count]) => {
            const isP1 = playerId === 1;
            const colorClass = isP1
              ? "bg-red-100 border-red-300 text-red-800"
              : "bg-blue-100 border-blue-300 text-blue-800";
            const dotColor = isP1 ? "bg-red-500" : "bg-blue-500";

            return (
              <div
                key={playerId}
                class={`
                        flex items-center gap-3 px-6 py-2
                        rounded-xl border-2 font-bold shadow-sm
                        transition-all transform hover:scale-105
                        ${colorClass}
                      `}
              >
                <div class={`w-3 h-3 rounded-full ${dotColor}`} />
                <span class="text-lg">
                  Jugador {playerId}: <span class="text-xl">{count}</span>
                </span>
              </div>
            );
          })}
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${cols}, min-content)`,
          gap: "0.5rem",
        }}
      >
        {boardSignals.map((cellSignal, index) => {
          const rowIndex = Math.floor(index / cols);
          const colIndex = index % cols;

          const cellData = cellSignal.value;

          return (
            <Cell
              key={`${rowIndex}-${colIndex}`}
              row={rowIndex}
              column={colIndex}
              points={cellData.points}
              player={cellData.player}
              onClick={handleCellClick}
            />
          );
        })}
      </div>
    </div>
  );
}
