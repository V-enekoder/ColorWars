import { GameMode } from "../utils/types.ts";

export default function Home() {
  const gameOptions = [
    {
      id: GameMode.HumanVsHuman,
      title: "Humano vs Humano",
      description: "Duelo local clásico para dos jugadores.",
      icon: "👥",
      color: "bg-blue-600",
    },
    {
      id: GameMode.HumanVsIA,
      title: "Humano vs IA",
      description: "Ponte a prueba contra la máquina.",
      icon: "🤖",
      color: "bg-indigo-600",
    },
    {
      id: GameMode.IAvsIA,
      title: "IA vs IA",
      description: "Observa cómo compiten dos algoritmos.",
      icon: "💻",
      color: "bg-slate-700",
    },
  ];

  return (
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
              href={`/game/${option.id}`}
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
  );
}
