import { CardColor } from "../utils/navigation.ts";

export interface CardProps {
  name: string;
  description: string;
  linkTo: string;
  color?: CardColor;
}

const colorMap: Record<CardColor, string> = {
  blue: "text-blue-600 border-blue-200 hover:border-blue-500 shadow-blue-900/5",
  indigo:
    "text-indigo-600 border-indigo-200 hover:border-indigo-500 shadow-indigo-900/5",
  red: "text-red-600 border-red-200 hover:border-red-500 shadow-red-900/5",
  emerald:
    "text-emerald-600 border-emerald-200 hover:border-emerald-500 shadow-emerald-900/5",
  slate:
    "text-slate-600 border-slate-200 hover:border-slate-500 shadow-slate-900/5",
};

export const Card = function Card({
  name,
  description,
  linkTo,
  color = "blue",
}: CardProps) {
  const colorClasses = colorMap[color];

  return (
    <a
      href={linkTo}
      class={`group relative bg-white border p-8 rounded-[2rem] shadow-sm hover:shadow-xl transition-all duration-300 ease-out hover:-translate-y-2 flex flex-col items-center text-center ${colorClasses}`}
    >
      <span class="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300 ease-out"></span>

      <h2 class="text-xl font-bold text-slate-800 mb-2">{name}</h2>
      <p class="text-sm text-slate-400 mb-6">{description}</p>

      <div
        class={`mt-auto font-bold text-xs uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
      >
        Go →
      </div>
    </a>
  );
};
