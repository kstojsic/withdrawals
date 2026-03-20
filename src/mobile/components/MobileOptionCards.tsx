interface Option<T extends string> {
  value: T;
  label: string;
}

interface MobileOptionCardsProps<T extends string> {
  label: string;
  options: Option<T>[];
  value: T | null;
  onChange: (v: T) => void;
}

export default function MobileOptionCards<T extends string>({
  label,
  options,
  value,
  onChange,
}: MobileOptionCardsProps<T>) {
  return (
    <div className="flex flex-col gap-3">
      <p className="font-semibold text-sm text-qt-primary">{label}</p>
      <div className="flex flex-col gap-2">
        {options.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={`min-h-[48px] w-full rounded-xl border-2 px-4 py-3 text-left text-sm font-semibold transition-colors cursor-pointer
              ${value === opt.value ? 'border-qt-green bg-qt-green-bg/40 text-qt-primary' : 'border-qt-border bg-white text-qt-primary active:bg-qt-bg-3'}`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}
