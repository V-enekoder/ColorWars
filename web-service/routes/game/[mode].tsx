import { Head } from "fresh/runtime";
import { define } from "../../utils.ts";
import { GameConfig } from "../../utils/types.ts";
import GameBoard from "../../islands/GameBoard.tsx";

export default define.page(function Game(ctx) {
  const { mode } = ctx.params;
  const { searchParams } = ctx.url;

  const getConfig = (): GameConfig => {
    return {
      mode: mode,
      rows: Number(searchParams.get("rows")) || 6,
      cols: Number(searchParams.get("cols")) || 6,
      criticalPoints: Number(searchParams.get("cp")) || 4,
      num_players: Number(searchParams.get("num_players")) || 2,
    };
  };

  const config = getConfig();

  return (
    <div class="min-h-screen bg-slate-50 text-slate-900 font-sans">
      <Head>
        <title>Color Wars | {config.mode}</title>
      </Head>

      {/* Fondo sutil con un degradado muy suave */}
      <div class="fixed inset-0 bg-gradient-to-br from-blue-50/50 via-white to-indigo-50/50 pointer-events-none"></div>

      <div class="relative z-10 max-w-5xl mx-auto px-6 py-10 flex flex-col min-h-screen">
        {/* HEADER: Limpio y profesional */}
        <header class="flex justify-between items-center mb-12">
          <div class="flex items-center gap-5">
            <a
              href="/"
              class="group p-2.5 rounded-xl bg-white hover:bg-slate-100 transition-all border border-slate-200 shadow-sm"
              title="Volver al menú"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="w-5 h-5 text-slate-500 group-hover:text-slate-900"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2.5"
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </a>
            <div>
              <h1 class="text-2xl font-black tracking-tight text-slate-800">
                COLOR <span class="text-blue-600">WARS</span>
              </h1>
              <p class="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
                Battle Arena
              </p>
            </div>
          </div>

          <div class="px-4 py-1.5 rounded-lg bg-blue-100 border border-blue-200 text-blue-700 text-xs font-bold shadow-sm">
            Modo: {config.mode}
          </div>
        </header>

        {/* CONTENIDO PRINCIPAL: Tablero sobre tarjeta blanca */}
        <main class="flex-grow flex items-center justify-center">
          <div class="bg-white border border-slate-200 p-8 rounded-[2rem] shadow-xl shadow-slate-200/60 transition-transform hover:scale-[1.01]">
            <GameBoard config={config} />
          </div>
        </main>

        {/* FOOTER: HUD tipo "Panel de Control" claro */}
        <footer class="mt-12 flex flex-col md:flex-row justify-between items-center gap-6 p-6 rounded-2xl bg-white/80 border border-slate-200 backdrop-blur-md shadow-sm">
          <div class="flex gap-8">
            <div class="flex flex-col">
              <span class="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Grid Size
              </span>
              <span class="text-lg font-semibold text-slate-700">
                {config.rows} <span class="text-slate-300">×</span>{" "}
                {config.cols}
              </span>
            </div>
            <div class="w-px h-10 bg-slate-100"></div>
            <div class="flex flex-col">
              <span class="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Critical Points
              </span>
              <span class="text-lg font-semibold text-slate-700">
                {config.criticalPoints}
              </span>
            </div>
          </div>

          <div class="flex items-center gap-4">
            <a
              href="/game/JvsJ?rows=10&cols=10&cp=3"
              class="px-5 py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 transition-all text-xs font-bold uppercase tracking-wide"
            >
              10x10 Pro
            </a>
            <button
              onClick={() => globalThis.location.reload()}
              class="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white transition-all text-xs font-bold uppercase tracking-wide shadow-md shadow-blue-200 active:scale-95"
            >
              Reiniciar
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
});
