import { useSignal } from "@preact/signals";
import { Stepper } from "../components/Stepper.tsx";
import { AgentType, Player, RulesOptions } from "../utils/types.ts";
import { AGENT_DESCRIPTIONS } from "../utils/constans.ts";

export default function GameSetup() {
  const rows = useSignal(8);
  const cols = useSignal(8);
  const cp = useSignal(4);
  const rule = useSignal(RulesOptions.OnlyOwnOrbs);
  const players = useSignal<Player[]>([
    { id: 1, name: "Random Bot", type: AgentType.RandomAI },
    { id: 2, name: "Random Bot", type: AgentType.RandomAI },
  ]);

  const addPlayer = () => {
    if (players.value.length < 8) {
      const newId = Math.max(...players.value.map((p) => p.id), 0) + 1;
      players.value = [
        ...players.value,
        { id: newId, name: `Player ${newId}`, type: AgentType.RandomAI },
      ];
    }
  };

  const removePlayer = (id: number) => {
    if (players.value.length > 2) {
      players.value = players.value.filter((p) => p.id !== id);
    }
  };

  const updatePlayer = (id: number, field: keyof Player, value: any) => {
    players.value = players.value.map((p) =>
      p.id === id ? { ...p, [field]: value } : p
    );
  };

  const handlePlay = () => {
    const params = new URLSearchParams({
      rows: rows.value.toString(),
      cols: cols.value.toString(),
      cp: cp.value.toString(),
      rule: rule.value,
      players: JSON.stringify(players.value),
    });
    globalThis.location.href = `/game/JvsJ?${params.toString()}`;
  };

  return (
    <div class="w-full max-w-6xl mx-auto space-y-8">
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        <aside class="lg:col-span-5 space-y-10 bg-white/50 p-8 rounded-[2.5rem] border border-slate-100 backdrop-blur-sm">
          <section class="space-y-6">
            <h3 class="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600">
              Board Dimensions
            </h3>
            <div class="flex gap-6 justify-center lg:justify-start">
              <Stepper
                label="Rows"
                value={rows.value}
                min={3}
                max={20}
                onChange={(v) => (rows.value = v)}
              />
              <Stepper
                label="Cols"
                value={cols.value}
                min={3}
                max={20}
                onChange={(v) => (cols.value = v)}
              />
            </div>
          </section>

          <section class="space-y-6">
            <h3 class="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600">
              Game Rules
            </h3>
            <div class="space-y-8">
              <div>
                <div class="flex justify-between mb-3">
                  <span class="text-xs font-bold text-slate-700">
                    Critical Points
                  </span>
                  <span class="text-xs font-black text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded-md">
                    {cp.value}
                  </span>
                </div>
                <input
                  type="range"
                  min={2}
                  max={6}
                  step={1}
                  value={cp.value}
                  onInput={(e) => (cp.value = parseInt(e.currentTarget.value))}
                  class="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
              </div>

              <div>
                <label class="text-[10px] font-black uppercase text-slate-400 block mb-3">
                  Ruleset Logic
                </label>
                <select
                  value={rule.value}
                  onChange={(
                    e,
                  ) => (rule.value = e.currentTarget.value as RulesOptions)}
                  class="w-full p-3.5 border border-slate-200 rounded-2xl bg-white text-sm font-medium outline-none focus:ring-4 ring-indigo-500/10 transition-all appearance-none cursor-pointer"
                >
                  <option value={RulesOptions.OnlyOwnOrbs}>
                    Only Own Orbs (Classic)
                  </option>
                  <option value={RulesOptions.EmptyAndOwnOrbs}>
                    Empty & Own Orbs (Aggressive)
                  </option>
                </select>
              </div>
            </div>
          </section>
        </aside>

        <main class="lg:col-span-7 space-y-6">
          <header class="flex justify-between items-end px-2">
            <div>
              <h3 class="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                Combatants
              </h3>
              <p class="text-2xl font-black text-slate-800">
                {players.value.length} <span class="text-slate-300">/ 8</span>
              </p>
            </div>
            {players.value.length < 8 && (
              <button
                type="button"
                onClick={addPlayer}
                class="px-4 py-2 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-blue-600 transition-all active:scale-95 shadow-lg shadow-slate-200"
              >
                + Add Player
              </button>
            )}
          </header>
          {/*Desde aqui se debe refactorizar */}
          <div class="grid gap-4 max-h-150 overflow-y-auto pr-2 custom-scrollbar">
            {players.value.map((p, index) => (
              <div
                key={p.id}
                class="group bg-white p-5 rounded-4xl border border-slate-200 shadow-sm hover:shadow-md transition-all"
              >
                <div class="flex flex-wrap items-center gap-4">
                  <div class="w-10 h-10 rounded-2xl bg-slate-50 flex items-center justify-center text-xs font-black text-slate-400 border border-slate-100">
                    0{index + 1}
                  </div>

                  <input
                    type="text"
                    class="grow min-w-30 bg-transparent border-b-2 border-slate-50 focus:border-blue-500 outline-none py-1 text-sm font-bold text-slate-700 transition-colors"
                    placeholder="Enter name..."
                    value={p.name}
                    onInput={(e) =>
                      updatePlayer(p.id, "name", e.currentTarget.value)}
                  />

                  <div class="flex items-center gap-2">
                    <select
                      class="bg-slate-50 px-4 py-2 rounded-xl text-xs font-bold text-slate-600 outline-none cursor-pointer hover:bg-slate-100 transition-colors"
                      value={p.type}
                      onChange={(e) =>
                        updatePlayer(
                          p.id,
                          "type",
                          e.currentTarget.value as AgentType,
                        )}
                    >
                      {Object.values(AgentType).map((type) => (
                        <option value={type}>
                          {type.charAt(0).toUpperCase() + type.slice(1)}
                        </option>
                      ))}
                    </select>

                    {players.value.length > 2 && (
                      <button
                        type="button"
                        onClick={() => removePlayer(p.id)}
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
                    {AGENT_DESCRIPTIONS[p.type]}
                  </p>
                </div>
              </div>
            ))}
          </div>
          {/*Hasta aqui */}
        </main>
      </div>

      <footer class="pt-8 border-t border-slate-100 flex justify-center">
        <button
          type="button"
          onClick={handlePlay}
          class="w-full md:w-auto px-12 py-5 bg-blue-600 text-white rounded-4xl
          font-black uppercase tracking-[0.3em] text-xs shadow-xl shadow-blue-200 hover:bg-blue-700
          hover:-translate-y-1 active:scale-95 transition-all"
        >
          Launch Battle Arena
        </button>
      </footer>
    </div>
  );
}
j;
