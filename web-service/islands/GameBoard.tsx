import { useSignal, useComputed, signal, Signal } from "@preact/signals";
import { useMemo } from "preact/hooks";
import { Cell } from "../components/Cell.tsx";
import { GameEngine, CellData } from "../core/GameLogic.ts";

interface GameConfig {
  rows: number;
  columns: number;
  critical_points: number;
}

export default function GameBoard({
  rows,
  columns,
  critical_points,
}: GameConfig) {
  const engine = useMemo(
    () => new GameEngine(rows, columns, critical_points, 2),
    [rows, columns, critical_points],
  );

  const boardSignals: Signal<CellData>[] = useMemo(() => {
    const initialBoard = engine.getBoard();
    return initialBoard.map((cellData) => signal(cellData));
  }, [engine]);

  const currentPlayerId = useSignal(engine.getCurrentPlayerId());
  const winner = useSignal(0);
  const playerCounts = useSignal<[number, number][]>(engine.getCellsByPlayer());

  const handleCellClick = (row: number, col: number) => {
    const success = engine.play(row, col);

    if (!success) {
      console.warn("Movimiento inválido o juego terminado");
      return;
    }

    const rawBoard = engine.getBoard();

    boardSignals.forEach((sig, index) => {
      sig.value = { ...rawBoard[index] };
    });

    currentPlayerId.value = engine.getCurrentPlayerId();
    winner.value = engine.winner;
    playerCounts.value = engine.getCellsByPlayer();
  };

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
          gridTemplateColumns: `repeat(${columns}, min-content)`,
          gap: "0.5rem",
        }}
      >
        {boardSignals.map((cellSignal, index) => {
          const rowIndex = Math.floor(index / columns);
          const colIndex = index % columns;

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
