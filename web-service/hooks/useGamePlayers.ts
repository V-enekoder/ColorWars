import { useComputed, useSignal } from "@preact/signals";
import { AgentStrategy, Player } from "../utils/types.ts";

export function useGamePlayers() {
  const players = useSignal<Player[]>([
    { id: 1, name: "Random Bot", type: AgentStrategy.RANDOM },
    { id: 2, name: "Random Bot", type: AgentStrategy.RANDOM },
  ]);
  const canRemove = useComputed(() => players.value.length > 2);
  const canAdd = useComputed(() => players.value.length < 8);
  const playerCount = useComputed(() => players.value.length);

  const addPlayer = () => {
    if (canAdd.value) {
      const newId = Math.max(...players.value.map((p) => p.id), 0) + 1;
      players.value = [
        ...players.value,
        { id: newId, name: `Player ${newId}`, type: AgentStrategy.RANDOM },
      ];
    }
  };
  const removePlayer = (id: number) => {
    if (players.value.length > 2) {
      players.value = players.value.filter((p) => p.id !== id);
    }
  };

  const updatePlayer = (
    id: number,
    field: Exclude<keyof Player, "id">,
    value: string | AgentStrategy,
  ) => {
    players.value = players.value.map((p) =>
      p.id === id ? { ...p, [field]: value } : p
    );
  };

  return {
    players,
    addPlayer,
    removePlayer,
    updatePlayer,
    canRemove,
    canAdd,
    playerCount,
  };
}
