import { useSignal, useComputed } from "@preact/signals";
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

  const boardState = useSignal<CellData[]>(engine.getBoard());
  const currentPlayerId = useSignal(engine.getCurrentPlayerId());
  const winner = useSignal(0);

  const handleCellClick = (row: number, col: number) => {
    const success = engine.play(row, col);

    if (success) {
      boardState.value = engine.getBoard();
      currentPlayerId.value = engine.getCurrentPlayerId();
      winner.value = engine.winner;
    } else {
      console.warn("Movimiento inválido o juego terminado");
    }
  };

  const message = useComputed(() => {
    return winner.value !== 0
      ? `¡Ganó el jugador ${winner.value}!`
      : `Turno: Jugador ${currentPlayerId.value}`;
  });

  return (
    <div class="flex flex-col items-center gap-4 p-4">
      <h2 class="text-2xl font-bold">{message}</h2>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${columns}, min-content)`,
          gap: "0.5rem",
        }}
      >
        {Array.from({ length: rows }).map((_, rowIndex) =>
          Array.from({ length: columns }).map((_, colIndex) => {
            const index = rowIndex * columns + colIndex;
            const cellData = boardState.value[index];

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
          }),
        )}
      </div>
    </div>
  );
}
