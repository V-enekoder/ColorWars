import { AgentType, Player } from "../utils/types.ts";

export interface PlayerScoreboardProps {
  playerId: number;
  player?: Player;
  count: number;
  isActive: boolean;
  color: string;
}

export const PlayerScoreboard = ({
  playerId,
  player,
  count,
  isActive,
  color,
}: PlayerScoreboardProps) => {
  const name = player ? player.name : `Jugador ${playerId}`;

  return (
    <div
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
        {player?.type === AgentType.HUMAN ? "👤" : "🤖"}
      </div>
      <span class="text-lg flex flex-col leading-tight">
        <span class="text-[10px] uppercase tracking-widest opacity-60">
          {player?.type === AgentType.HUMAN ? "Humano" : "Sistema IA"}
        </span>
        <span class="truncate max-w-25">{name}</span>
      </span>
      <div class="text-3xl ml-2 font-black">{count}</div>
    </div>
  );
};
