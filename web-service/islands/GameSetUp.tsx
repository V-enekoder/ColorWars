import { useSignal } from "@preact/signals";
import { Stepper } from "../components/Stepper.tsx";
import { Button } from "../components/Button.tsx";
import { RulesOptions, Player, AgentType } from "../utils/types.ts";

export default function GameSetup() {
  const rows = useSignal(10);
  const cols = useSignal(10);
  const cp = useSignal(3);
  const rule = useSignal(RulesOptions.OnlyOwnOrbs);

  // Iniciamos con 2 jugadores (mínimo funcional)
  const players = useSignal<Player[]>([
    { id: 1, name: "Victor", type: AgentType.Human },
    { id: 2, name: "Random Bot", type: AgentType.RandomAI },
  ]);

  const addPlayer = () => {
    if (players.value.length < 8) {
      const newId = Math.max(...players.value.map((p) => p.id), 0) + 1;
      players.value = [
        ...players.value,
        { id: newId, name: `Player ${newId}`, type: AgentType.Human },
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
      p.id === id ? { ...p, [field]: value } : p,
    );
  };

  const handlePlay = () => {
    const params = new URLSearchParams({
      rows: rows.value.toString(),
      cols: cols.value.toString(),
      cp: cp.value.toString(),
      rule: rule.value,
      // Serializamos el array a JSON para pasarlo por URL
      players: JSON.stringify(players.value),
    });

    globalThis.location.href = `/game/JvsJ?${params.toString()}`;
  };

  return (
    <div class="flex flex-col gap-8 w-full max-w-2xl mx-auto">
      {/* Configuración del Tablero */}
      <div class="grid grid-cols-2 gap-4">
        <Stepper
          label="Rows"
          value={rows.value}
          min={3}
          max={15}
          onChange={(v) => (rows.value = v)}
        />
        <Stepper
          label="Cols"
          value={cols.value}
          min={3}
          max={15}
          onChange={(v) => (cols.value = v)}
        />
      </div>

      {/* Reglas Rápidas */}
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
        <div>
          <p class="text-[10px] font-black uppercase text-slate-400 mb-3 tracking-widest">
            Critical Points: {cp.value}
          </p>
          <input
            type="range"
            min={2}
            max={5}
            step={1}
            value={cp.value}
            onInput={(e) => (cp.value = parseInt(e.currentTarget.value))}
            class="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
        </div>

        <div>
          <label class="text-[10px] font-black uppercase text-slate-400 block mb-2 tracking-widest">
            Ruleset
          </label>
          <select
            value={rule.value}
            onChange={(e) =>
              (rule.value = e.currentTarget.value as RulesOptions)
            }
            class="w-full p-2.5 border border-slate-200 rounded-xl bg-white text-sm outline-none focus:ring-2 ring-blue-500/20"
          >
            <option value={RulesOptions.OnlyOwnOrbs}>Only Own Orbs</option>
            <option value={RulesOptions.EmptyAndOwnOrbs}>
              Empty And Own Orbs
            </option>
          </select>
        </div>
      </div>

      {/* Gestión de Jugadores */}
      <div class="space-y-4">
        <div class="flex justify-between items-center border-b border-slate-100 pb-2">
          <h3 class="text-xs font-black uppercase text-slate-400 tracking-widest">
            Players ({players.value.length}/8)
          </h3>
          {players.value.length < 8 && (
            <button
              onClick={addPlayer}
              class="text-[10px] bg-blue-50 text-blue-600 px-3 py-1 rounded-full font-bold hover:bg-blue-100 transition-colors"
            >
              + Add Player
            </button>
          )}
        </div>

        <div class="grid gap-3">
          {players.value.map((p, index) => (
            <div
              key={p.id}
              class="flex items-center gap-3 bg-white p-3 rounded-2xl border border-slate-100 shadow-sm"
            >
              <div class="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-500">
                P{index + 1}
              </div>

              <input
                type="text"
                class="flex-grow p-2 border-b border-transparent focus:border-blue-500 outline-none text-sm font-medium"
                placeholder="Name..."
                value={p.name}
                onInput={(e) =>
                  updatePlayer(p.id, "name", e.currentTarget.value)
                }
              />

              <select
                class="bg-slate-50 p-2 rounded-lg text-xs font-bold outline-none"
                value={p.type}
                onChange={(e) =>
                  updatePlayer(p.id, "type", e.currentTarget.value as AgentType)
                }
              >
                <option value={AgentType.Human}>Human</option>
                <option value={AgentType.RandomAI}>Random AI</option>
                <option value={AgentType.MinimaxAI}>Minimax AI</option>
              </select>

              {players.value.length > 2 && (
                <button
                  onClick={() => removePlayer(p.id)}
                  class="p-2 text-slate-300 hover:text-red-500 transition-colors"
                >
                  ✕
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      <Button onClick={handlePlay}>Launch Battle</Button>
    </div>
  );
}
