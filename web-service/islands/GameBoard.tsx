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
      mode != GameMode.HumanVsHuman
    ) {
      const move = RandomBot.getMove(engine);
      if (move) handleCellClick(move.r, move.c);

      if (GameMode.IAvsIA) delay(100);
    }
  }, [currentPlayerId.value, isAnimating.value]);

  const message = useComputed(() => {
    return winner.value !== 0
      ? `¡Ganó el jugador ${winner.value}!`
      : `Turno: Jugador ${currentPlayerId.value}`;
  });

  return (
    <div class="flex flex-col items-center gap-4 p-4 min-h-screen bg-white">
      <h2 class="text-3xl font-extrabold text-slate-800 tracking-tight mb-2">
        {message}
      </h2>

      <div class="flex flex-wrap justify-center gap-6 mb-8">
        {[...playerCounts.value]
          .filter(([id]) => id !== 0)
          .sort((a, b) => b[1] - a[1])
          .map(([playerId, count]) => {
            const playerInfo = players.find((p) => p.id === playerId);
            const playerName = playerInfo
              ? playerInfo.name
              : `Jugador ${playerId}`;
            const color = PLAYER_COLOR_MAP[playerId] || "#cbd5e1";
            const isActive = playerId === currentPlayerId.value;

            return (
              <div
                key={playerId}
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
                  {playerInfo?.type === "bot" ? "🤖" : "👤"}
                </div>
                <span class="text-lg flex flex-col leading-tight">
                  <span class="text-[10px] uppercase tracking-widest opacity-60">
                    {playerInfo?.type === "bot" ? "Sistema IA" : "Humano"}
                  </span>
                  <span class="truncate max-w-[100px]">{playerName}</span>
                </span>
                <div class="text-3xl ml-2 font-black">{count}</div>
              </div>
            );
          })}
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${cols}, min-content)`,
          gap: "0.4rem",
        }}
      >
        {boardSignals.map((cellSignal, index) => {
          const rowIndex = Math.floor(index / cols);
          const colIndex = index % cols;
          const cellData = cellSignal.value;
          const limit = criticalPoints[index];
          const isCritical = cellData.points === limit - 1;

          return (
            <Cell
              key={`${rowIndex}-${colIndex}`}
              row={rowIndex}
              column={colIndex}
              points={cellData.points}
              player={cellData.player}
              isCritical={isCritical}
              onClick={handleCellClick}
            />
          );
        })}
      </div>
    </div>
  );
}
