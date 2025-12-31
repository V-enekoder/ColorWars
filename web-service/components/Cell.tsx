import { PlayerColor } from "../utils/types.ts";
import { memo } from "preact/compat";

export interface CellProps {
  row: number;
  column: number;
  points: number;
  player: number;
  onClick: (r: number, c: number) => void;
  isCritical: boolean;
}

const PLAYER_COLOR_MAP: string[] = [
  PlayerColor.White,
  PlayerColor.Red,
  PlayerColor.Blue,
  PlayerColor.Green,
  PlayerColor.Yellow,
  PlayerColor.Purple,
  PlayerColor.Orange,
  PlayerColor.Pink,
  PlayerColor.Cyan,
];

export const Cell = memo(function Cell({
  points,
  player,
  onClick,
  row,
  column,
  isCritical,
}: CellProps) {
  const color = PLAYER_COLOR_MAP[player] || "#94a3b8";

  const renderAtoms = () => {
    if (points === 0) return null;

    const Atom = () => (
      <div
        class="w-2.5 h-2.5 rounded-full bg-white animate-pulse shadow-sm"
        style={{ boxShadow: "0 0 4px rgba(0,0,0,0.3)" }}
      />
    );

    if (points === 1) {
      return <Atom />;
    }

    if (points === 2) {
      return (
        <div class="flex gap-1">
          <Atom />
          <Atom />
        </div>
      );
    }

    if (points === 3) {
      return (
        <div class="flex flex-col items-center gap-1">
          <div class="flex gap-1">
            <Atom />
            <Atom />
          </div>
          <Atom />
        </div>
      );
    }

    return (
      <div class="grid grid-cols-2 gap-1">
        {[...Array(points)].map((_, i) => (
          <Atom key={i} />
        ))}
      </div>
    );
  };

  return (
    <button
      onClick={() => onClick(row, column)}
      class={`
          w-14 h-14 border-2 rounded-xl
          flex items-center justify-center transition-all duration-300
          hover:scale-110 active:scale-95
          ${
            isCritical
              ? "animate-pulse border-white z-10"
              : "border-gray-700/20 shadow-sm"
          }
        `}
      style={{
        backgroundColor: color,
        boxShadow: isCritical
          ? `0 0 20px ${color}, inset 0 0 10px rgba(255,255,255,0.5)`
          : points > 0
            ? `inset 0 0 12px rgba(0,0,0,0.1)`
            : "none",
        transform: isCritical ? "scale(1.1)" : "scale(1)",
      }}
    >
      <div class="relative w-full h-full flex items-center justify-center">
        {renderAtoms()}
      </div>
    </button>
  );
});
