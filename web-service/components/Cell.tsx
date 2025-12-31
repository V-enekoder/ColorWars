import { PlayerColor } from "../utils/types.ts";
import { memo } from "preact/compat";

export interface CellProps {
  row: number;
  column: number;
  points: number;
  player: number;
  onClick: (r: number, c: number) => void;
  isCritical: boolean;
  limit: number;
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
  limit,
}: CellProps) {
  const color = PLAYER_COLOR_MAP[player] || "#94a3b8";

  const intensity = points / limit;
  isCritical = points === limit - 1;

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
      class="w-14 h-14 rounded-xl border-2 flex items-center justify-center transition-colors duration-200 relative"
      style={{
        backgroundColor: color,

        filter: points > 0 ? `brightness(${0.9 + intensity * 0.4})` : "none",

        boxShadow:
          points > 0
            ? `inset 0 2px 4px rgba(255,255,255,0.4),
               inset 0 -2px 4px rgba(0,0,0,0.2)
               ${isCritical ? `, 0 0 12px ${color}` : ""}`
            : "none",
        borderColor: `rgba(0,0,0,${0.1 + intensity * 0.3})`,
      }}
    >
      {renderAtoms()}
    </button>
  );
});
