interface StepperProps {
  label: string;
  value: number;
  min?: number;
  max?: number;
  onChange: (newValue: number) => void;
}

export function Stepper({
  label,
  value,
  min = 1,
  max = 20,
  onChange,
}: StepperProps) {
  const increment = () => {
    if (value < max) onChange(value + 1);
  };

  const decrement = () => {
    if (value > min) onChange(value - 1);
  };

  return (
    <div class="flex flex-col gap-2 items-center">
      <label class="text-xs font-black uppercase tracking-widest text-slate-400">
        {label}
      </label>
      <div class="flex items-center bg-white border border-slate-200 rounded-2xl p-1 shadow-sm w-full max-w-[160px]">
        <button
          type="button"
          onClick={decrement}
          disabled={value <= min}
          class="w-10 h-10 flex items-center justify-center rounded-xl transition-all active:scale-90 disabled:opacity-30 disabled:active:scale-100 hover:bg-slate-50 text-slate-600 font-bold"
        >
          −
        </button>

        <div class="grow text-center font-bold text-slate-800 tabular-nums">
          {value}
        </div>

        <button
          type="button"
          onClick={increment}
          disabled={value >= max}
          class="w-10 h-10 flex items-center justify-center rounded-xl transition-all active:scale-90 disabled:opacity-30 disabled:active:scale-100 hover:bg-slate-50 text-slate-600 font-bold"
        >
          +
        </button>
      </div>
    </div>
  );
}
