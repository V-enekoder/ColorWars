import { define } from "../utils.ts";

import GameSetup from "../islands/GameSetup.tsx";

export default define.page(function Configuration(_ctx) {
  return (
    <div class="min-h-screen bg-slate-50 text-slate-900 font-sans">
      <div class="fixed inset-0 bg-linear-to-br from-blue-50/50 via-white to-indigo-50/50 pointer-events-none">
      </div>

      <div class="relative z-10 max-w-5xl mx-auto px-6 py-10 flex flex-col min-h-screen">
        <header class="flex justify-between items-center mb-12">
          <div class="flex items-center gap-5">
            <a
              href="/"
              class="group p-2.5 rounded-xl bg-white hover:bg-slate-10 transition-all border border-slate-200 shadow-sm"
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
              <p class="text-[12px] font-bold uppercase tracking-[0.2em] text-slate-400">
                Battle Arena
              </p>
            </div>
          </div>
        </header>

        <main class="grow flex items-center justify-center">
          <div class="bg-white border border-slate-200 p-8 rounded-4xl shadow-xl shadow-slate-200/60 transition-transform">
            <GameSetup />
          </div>
        </main>
      </div>
    </div>
  );
});
