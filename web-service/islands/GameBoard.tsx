import { useSignal, useComputed, signal, Signal } from "@preact/signals";
import { useMemo } from "preact/hooks";
import { Cell } from "../components/Cell.tsx";
import { GameEngine, CellData } from "../core/GameLogic.ts";
import { RandomBot } from "../core/AI.ts";
import { useCallback, useEffect } from "preact/hooks";
import {
  GameConfig,
  GameMode,
  AgentType,
  PLAYER_COLOR_MAP,
} from "../utils/types.ts";

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

export default function GameBoard({ config }: { config: GameConfig }) {
  const { mode, rows, cols, criticalPoints, players } = config;

  const engine = useMemo(() => {
    return new GameEngine(rows, cols, criticalPoints, players.length);
  }, [rows, cols, criticalPoints, players.length]);

  const boardSignals: Signal<CellData>[] = useMemo(() => {
    const initialBoard = engine.getBoard();
    return initialBoard.map((cellData) => signal(cellData));
  }, [engine]);

  const currentPlayerId = useSignal(engine.getCurrentPlayerId());
  const winner = useSignal(0);
  const playerCounts = useSignal<[number, number][]>(engine.getCellsByPlayer());
  const isAnimating = useSignal(false);

  const handleCellClick = useCallback(
    async (row: number, col: number) => {
      if (isAnimating.value || engine.winner !== 0) return;

      const generator = engine.playGenerator(row, col);

      let next = generator.next();

      if (next.done) {
        console.warn("Movimiento inválido");
        return;
      }

      isAnimating.value = true;

      try {
        let steps = 0;
        while (!next.done) {
          steps++;
          const rawBoard = next.value;
          boardSignals.forEach((sig, index) => {
            const newCell = rawBoard[index];
            const currentVal = sig.value;
            if (
              currentVal.points !== newCell.points ||
              currentVal.player !== newCell.player
            ) {
              sig.value = { ...newCell };
            }
          });

          playerCounts.value = engine.getCellsByPlayer();

          const dynamicDelay = Math.max(30, 150 - steps * 5);
          await delay(dynamicDelay);

          next = generator.next();
        }
      } finally {
        currentPlayerId.value = engine.getCurrentPlayerId();
        winner.value = engine.winner;
        isAnimating.value = false;
      }
    },
    [engine],
  );

  useEffect(() => {
    const typePlayer = players[engine.getCurrentPlayerId() - 1].type;
    if (
      typePlayer === AgentType.RandomAI &&
      !isAnimating.value &&
      mode === GameMode.HumanVsIA
    ) {
      const move = RandomBot.getMove(engine);
      if (move) handleCellClick(move.r, move.c);
    }
  }, [currentPlayerId.value, isAnimating.value]);

  useEffect(() => {
    const typePlayer = players[engine.getCurrentPlayerId() - 1].type;
    if (
      typePlayer === AgentType.RandomAI &&
      !isAnimating.value &&
      mode === GameMode.IAvsIA
    ) {
      const move = RandomBot.getMove(engine);
      if (move) handleCellClick(move.r, move.c);
      delay(100);
    }
  }, [currentPlayerId.value, isAnimating.value]);

  const message = useComputed(() => {
    return winner.value !== 0
      ? `¡Ganó el jugador ${winner.value}!`
      : `Turno: Jugador ${currentPlayerId.value}`;
  });
  return (
    <div class="flex flex-col items-center gap-4 p-4">
      <h2 class="text-2xl font-bold">{message}</h2>

      <div class="flex flex-wrap justify-center gap-6 mb-6">
        {playerCounts.value
          .filter(([id]) => id !== 0)
          .sort((a, b) => a[0] - b[0])
          .map(([playerId, count]) => {
            const playerInfo = players.find((p) => p.id === playerId);
            const playerName = playerInfo
              ? playerInfo.name
              : `Jugador ${playerId}`;
            const color = PLAYER_COLOR_MAP[playerId] || PlayerColor.Gray;

            const isActive = playerId === currentPlayerId.value;

            return (
              <div
                key={playerId}
                class={`
                  relative flex items-center gap-3 px-6 py-2 rounded-xl border-2
                  font-bold transition-all duration-500 transform
                  ${isActive ? "scale-110 z-10" : "scale-100 opacity-60"}
                `}
                style={{
                  borderColor: color,
                  backgroundColor: `${color}${isActive ? "30" : "05"}`,
                  color: color,
                  boxShadow: isActive ? `0 0 20px ${color}60` : "none",
                }}
              >
                <div
                  class={`w-3 h-3 rounded-full ${isActive ? "animate-ping" : ""}`}
                  style={{ backgroundColor: color }}
                />

                <span class="text-lg flex flex-col leading-tight">
                  <span class="text-xs uppercase tracking-widest opacity-70">
                    {playerInfo?.type === "bot" ? "🤖 Bot" : "👤 Humano"}
                  </span>
                  {playerName}: <span class="text-xl">{count}</span>
                </span>

                {isActive && (
                  <div
                    class="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0
                        border-l-[8px] border-l-transparent
                        border-r-[8px] border-r-transparent
                        border-t-[8px]"
                    style={{ borderTopColor: color }}
                  />
                )}
              </div>
            );
          })}
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${cols}, min-content)`,
          gap: "0.5rem",
        }}
      >
        {boardSignals.map((cellSignal, index) => {
          const rowIndex = Math.floor(index / cols);
          const colIndex = index % cols;
          const cellData = cellSignal.value;

          return (
            <Cell
              key={`${rowIndex}-${colIndex}`}
              row={rowIndex}
              column={colIndex}
              points={cellData.points}
              player={cellData.player}
              onClick={handleCellClick}
            />
          );
        })}
      </div>
    </div>
  );
}
