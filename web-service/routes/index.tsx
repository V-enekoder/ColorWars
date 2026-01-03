import { Card } from "../components/Card.tsx";
import { sectionOptions } from "../utils/navigation.ts";
export default function Home() {
  return (
    <div class="min-h-screen bg-slate-50 text-slate-900 font-sans">
      <div class="max-w-4xl mx-auto px-6 py-20 flex flex-col items-center">
        <div class="mb-16 text-center">
          <div class="inline-block p-4 bg-white rounded-3xl shadow-sm border border-slate-200 mb-6 transition-transform hover:rotate-3">
            <img src="/logo.svg" width="80" height="80" alt="Color Wars Logo" />
          </div>
          <h1 class="text-5xl font-black tracking-tight text-slate-800 mb-2">
            COLOR <span class="text-blue-600">WARS</span>
          </h1>
          <p class="text-slate-500 font-medium uppercase tracking-widest text-xs">
            The Ultimate Strategy Engine
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
          {sectionOptions.map((section) => (
            <Card
              name={section.title}
              description={section.description}
              linkTo={section.link}
            />
          ))}
        </div>

        <footer class="mt-20 text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em] flex items-center gap-3">
          <span>Deno Fresh</span>
          <span class="w-1 h-1 bg-slate-300 rounded-full"></span>
          <span>Color Wars Engine</span>
        </footer>
      </div>
    </div>
  );
}
