import { AgentType, Player } from "../utils/types.ts";
import { AGENT_DESCRIPTIONS, AGENT_LABELS } from "../utils/constans.ts";

const AGENT_OPTIONS_UI = (Object.entries(AGENT_LABELS) as [AgentType, string][])
  .map(
    ([type, label]) => (
      <option key={type} value={type}>
        {label}
      </option>
    ),
  );
export interface PlayerCardProps {
  player: Player;
  index: number;
  updatePlayer: (
    id: number,
    field: "name" | "type",
    value: string | AgentType,
  ) => void;
  removePlayer: (id: number) => void;
  canRemove: boolean;
}

export const PlayerCard = ({
  player,
  index,
  canRemove,
  updatePlayer,
  removePlayer,
}: PlayerCardProps) => {
  const formattedIndex = (index + 1).toString().padStart(2, "0");
  return (
    <div class="group bg-white p-5 rounded-4xl border border-slate-200 shadow-sm hover:shadow-md transition-all">
      <div class="flex items-center gap-4">
        <div class="w-10 h-10 shrink-0 rounded-2xl bg-slate-50 flex items-center justify-center text-sm font-black text-slate-400 border border-slate-100">
          {formattedIndex}
        </div>

        <div class="flex flex-1 items-center gap-3 flex-wrap sm:flex-nowrap">
          <input
            type="text"
            class="flex-1 min-w-30 bg-transparent border-b-2 border-slate-50 focus:border-blue-500 outline-none py-1 text-base font-bold text-slate-700 transition-colors"
            placeholder="Enter name..."
            value={player.name}
            onInput={(e) =>
              updatePlayer(player.id, "name", e.currentTarget.value)}
          />

          <select
            class="w-full sm:w-auto bg-slate-50 px-3 py-1.5 rounded-xl text-sm font-bold text-slate-600 outline-none cursor-pointer hover:bg-slate-100 transition-colors border border-transparent focus:border-slate-200"
            value={player.type}
            onChange={(e) =>
              updatePlayer(
                player.id,
                "type",
                e.currentTarget.value as AgentType,
              )}
          >
            {AGENT_OPTIONS_UI}
          </select>
        </div>

        <div class="w-8 flex justify-center shrink-0">
          {canRemove && (
            <button
              type="button"
              onClick={() => removePlayer(player.id)}
              class="p-2 text-slate-300 hover:text-red-500 transition-colors rounded-full hover:bg-red-50"
              title="Remove player"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}
        </div>
      </div>

      <div class="mt-3 pt-3 border-t border-slate-50 pl-14">
        <p class="text-[15px] leading-relaxed text-slate-400 font-medium italic">
          <span class="text-blue-500 not-italic font-bold uppercase mr-2 text-[14px] tracking-wider">
            Strategy:
          </span>
          {AGENT_DESCRIPTIONS[player.type]}
        </p>
      </div>
    </div>
  );
};
