import { useSignal, useComputed } from "@preact/signals";
import { Cell } from "../components/Cell.tsx";
import { GameEngine, CellData } from "../utils/GameLogic.ts";

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
  const engine = new GameEngine(rows, columns, critical_points);

  const initialBoard = Array.from({ length: rows * columns }, () => ({
    points: 0,
    player: 0,
  }));

  const boardState = useSignal<CellData[]>(initialBoard);
  const turn = useSignal(1);
  const move_turn = useSignal(1);
  const winner = useSignal(0);
  const playersWhoPlayed = useSignal(new Set<number>());
  const handleCellClick = (row: number, col: number) => {
    const currentPlayer: number = turn.value;

    const isFirstMove = !playersWhoPlayed.value.has(currentPlayer);
    if (
      !engine.canPlay(
        boardState.value,
        row,
        col,
        currentPlayer,
        move_turn.value,
      )
    ) {
      console.warn("Movimiento inválido");
      return;
    }
    const nextBoard = engine.applyMove(
      boardState.value,
      row,
      col,
      currentPlayer,
      isFirstMove,
    );
    if (isFirstMove) {
      const newSet = new Set(playersWhoPlayed.value);
      newSet.add(currentPlayer);
      playersWhoPlayed.value = newSet;
    }

    boardState.value = nextBoard;
    winner.value = engine.checkWinner(nextBoard, move_turn.value);
    if (turn.value == 2) move_turn.value++;
    turn.value = turn.value === 1 ? 2 : 1;
  };

  const message = useComputed(() => {
    return winner.value !== 0
      ? `Ganó el jugador ${winner.value}`
      : `Turno: Jugador ${turn.value}`;
  });

  return (
    <div class="flex flex-col items-center gap-4 p-4">
      <h2 class="text-2xl">{message}</h2>
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
