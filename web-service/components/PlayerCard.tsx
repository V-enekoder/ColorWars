import { AgentType, Player } from "../utils/types.ts";
import { AGENT_DESCRIPTIONS } from "../utils/constans.ts";
import { ComponentChildren } from "preact";

export interface PlayerCardProps {
  player: Player;
  index: number;
  // Cambiamos any por tipos específicos para evitar bugs de lógica
  updatePlayer: (
    id: number,
    field: keyof Player,
    value: string | AgentType,
  ) => void;
  removePlayer: (id: number) => void;
  canRemove: boolean;
  // Usamos ComponentChildren que es el estándar de Preact para fragmentos de VNode
  agentOptions: ComponentChildren;
}

export const PlayerCard = ({
  player,
  index,
  canRemove,
  updatePlayer,
  removePlayer,
  agentOptions, // Inyectamos las opciones pre-calculadas
}: PlayerCardProps) => {
  const formattedIndex = (index + 1).toString().padStart(2, "0");

  return (
    <div class="group bg-white p-5 rounded-4xl border border-slate-200 shadow-sm hover:shadow-md transition-all">
      <div class="flex flex-wrap items-center gap-4">
        <div class="w-10 h-10 rounded-2xl bg-slate-50 flex items-center justify-center text-xs font-black text-slate-400 border border-slate-100">
          {formattedIndex}
        </div>

        <input
          type="text"
          class="grow min-w-30 bg-transparent border-b-2 border-slate-50 focus:border-blue-500 outline-none py-1 text-sm font-bold text-slate-700 transition-colors"
          placeholder="Enter name..."
          value={player.name}
          onInput={(e) =>
            updatePlayer(player.id, "name", e.currentTarget.value)}
        />

        <div class="flex items-center gap-2">
          <select
            class="bg-slate-50 px-4 py-2 rounded-xl text-xs font-bold text-slate-600 outline-none cursor-pointer hover:bg-slate-100 transition-colors"
            value={player.type}
            onChange={(e) =>
              updatePlayer(
                player.id,
                "type",
                e.currentTarget.value as AgentType,
              )}
          >
            {/* Usamos las opciones inyectadas para evitar re-cálculos */}
            {agentOptions}
          </select>

          {canRemove && (
            <button
              type="button"
              onClick={() => removePlayer(player.id)} // Corregido p.id -> player.id
              class="p-2 text-slate-300 hover:text-red-500 transition-colors"
              title="Remove player"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2.5"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}
        </div>
      </div>

      <div class="mt-4 pt-4 border-t border-slate-50">
        <p class="text-[14px] leading-relaxed text-slate-400 font-semibold italic">
          <span class="text-blue-500 not-italic font-bold uppercase mr-2">
            Behavior:
          </span>
          {AGENT_DESCRIPTIONS[player.type]}
        </p>
      </div>
    </div>
  );
};
