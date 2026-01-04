import { define } from "../utils.ts";

import GameSetup from "../islands/GameSetUp.tsx";

export default define.page(function Configuration(ctx) {
  return (
    <div class="min-h-screen bg-slate-50 text-slate-900 font-sans">
      <div class="fixed inset-0 bg-gradient-to-br from-blue-50/50 via-white to-indigo-50/50 pointer-events-none">
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
              <p class="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
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

  /*return (
    <div class="min-h-screen bg-slate-50 text-slate-900 font-sans">
      <div class="max-w-4xl mx-auto px-6 py-20 flex flex-col items-center">
        <div class="mb-16 text-center">
          <div class="inline-block p-4 bg-white rounded-3xl shadow-sm border border-slate-200 mb-6">
            <img src="/logo.svg" width="80" height="80" alt="Color Wars Logo" />
          </div>
          <h1 class="text-5xl font-black tracking-tight text-slate-800 mb-2">
            COLOR <span class="text-blue-600">WARS</span>
          </h1>
          <p class="text-slate-500 font-medium">
            Selecciona tu modo de combate
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
          {gameOptions.map((option) => (
            <a
              key={option.id}
              href={`/gameConfig`}
              class="group relative bg-white border border-slate-200 p-8 rounded-[2rem] shadow-sm hover:shadow-xl hover:shadow-blue-900/5 transition-all hover:-translate-y-2 flex flex-col items-center text-center"
            >
              <span class="text-4xl mb-4 group-hover:scale-110 transition-transform">
                {option.icon}
              </span>
              <h2 class="text-xl font-bold text-slate-800 mb-2">
                {option.title}
              </h2>
              <p class="text-sm text-slate-400 mb-6">{option.description}</p>

              <div
                class={`mt-auto px-6 py-2 rounded-xl ${option.color} text-white text-xs font-bold uppercase tracking-wider shadow-md opacity-90 group-hover:opacity-100 transition-opacity`}
              >
                Seleccionar
              </div>
            </a>
          ))}
        </div>

        <footer class="mt-20 text-slate-400 text-xs font-medium uppercase tracking-[0.2em]">
          Deno Fresh × Color Wars Engine
        </footer>
      </div>
    </div>
  );*/
});
