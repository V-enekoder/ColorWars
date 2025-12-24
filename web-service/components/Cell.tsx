import type { ComponentChildren } from "preact";

export interface CellProps {
  row: number;
  column: number;
  points: number; // Cantidad de átomos (0, 1, 2, 3)
  player: number; // Quién es el dueño (0=Nadie, 1=J1, 2=J2)
  onClick: (r: number, c: number) => void; // Función que avisa al padre "me clickearon"
}

export function Cell({ row, column, points, player, onClick }: CellProps) {
  // Lógica visual simple: Si player es 1, fondo rojo. Si es 2, azul.
  let colorClass = "bg-white";
  if (player === 1) colorClass = "bg-red-200";
  if (player === 2) colorClass = "bg-blue-200";

  return (
    <button
      onClick={() => onClick(row, column)} // Al hacer click, enviamos nuestras coordenadas
      class={`w-12 h-12 border-2 border-gray-500 rounded-md font-bold text-xl transition-colors ${colorClass}`}
    >
      {/* Si hay puntos, mostramos el número. Si es 0, mostramos nada */}
      {points > 0 ? points : ""}
    </button>
  );
}
