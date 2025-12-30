import type { ComponentChildren } from "preact";
import { memo } from "preact/compat";
export interface CellProps {
  row: number;
  column: number;
  points: number; // Cantidad de átomos
  player: number; // Quién es el dueño (0=Nadie, 1=J1, 2=J2)
  onClick: (r: number, c: number) => void;
}

export const Cell = memo(function Cell({
  row,
  column,
  points,
  player,
  onClick,
}: CellProps) {
  let colorClass = "bg-white";
  if (player === 1) colorClass = "bg-red-200";
  if (player === 2) colorClass = "bg-blue-200";

  console.log(`Renderizando Celda: [${row}, ${column}]`);

  return (
    <button
      onClick={() => onClick(row, column)}
      class={`w-12 h-12 border-2 border-gray-500 rounded-md font-bold text-xl transition-colors ${colorClass}`}
    >
      {points > 0 ? points : ""}
    </button>
  );
});

/*export function Cell({ row, column, points, player, onClick }: CellProps) {
  let colorClass = "bg-white";
  if (player === 1) colorClass = "bg-red-200";
  if (player === 2) colorClass = "bg-blue-200";

  console.log(`Renderizando Celda: [${row}, ${column}]`);

  return (
    <button
      onClick={() => onClick(row, column)}
      class={`w-12 h-12 border-2 border-gray-500 rounded-md font-bold text-xl transition-colors ${colorClass}`}
    >
      {points > 0 ? points : ""}
    </button>
  );
}*/
