import { useSignal } from "@preact/signals";
import { Stepper } from "../components/Stepper.tsx";
import { RulesOptions } from "../utils/types.ts";
import { PlayerCard } from "../components/PlayerCard.tsx";
import { useGamePlayers } from "../hooks/useGamePlayers.ts";

export default function GameSetup() {
  const rows = useSignal(8);
  const cols = useSignal(8);
  const cp = useSignal(4);
  const rule = useSignal(RulesOptions.OnlyOwnOrbs);

  const {
    players,
    addPlayer,
    removePlayer,
    updatePlayer,
    canRemove,
    canAdd,
    playerCount,
  } = useGamePlayers();

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
                  min={4}
                  max={10}
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
                {playerCount} <span class="text-slate-300">/ 8</span>
              </p>
            </div>
            {canAdd.value && (
              <button
                type="button"
                onClick={addPlayer}
                class="px-4 py-2 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-blue-600 transition-all active:scale-95 shadow-lg shadow-slate-200"
              >
                + Add Player
              </button>
            )}
          </header>

          <div class="grid gap-4 max-h-150 overflow-y-auto pr-2 custom-scrollbar">
            {players.value.map((player, index) => (
              <PlayerCard
                key={player.id}
                player={player}
                index={index}
                canRemove={canRemove.value}
                updatePlayer={updatePlayer}
                removePlayer={removePlayer}
              />
            ))}
          </div>
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
