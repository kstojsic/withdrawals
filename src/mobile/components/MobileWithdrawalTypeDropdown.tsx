import { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

export interface MobileWithdrawalTypeOption<T extends string> {
  value: T;
  label: string;
  badge?: string;
}

interface MobileWithdrawalTypeDropdownProps<T extends string> {
  label?: string;
  options: MobileWithdrawalTypeOption<T>[];
  value: T | '';
  onChange: (v: T) => void;
}

export default function MobileWithdrawalTypeDropdown<T extends string>({
  label = 'Withdrawal type',
  options,
  value,
  onChange,
}: MobileWithdrawalTypeDropdownProps<T>) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const selected = options.find((o) => o.value === value);

  return (
    <div className="flex flex-col gap-1" ref={ref}>
      <label className="font-semibold text-xs text-qt-primary">{label}</label>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`relative w-full min-h-[40px] rounded-lg border-2 bg-white px-3 pr-10 text-left text-xs text-qt-primary
          outline-none transition-colors cursor-pointer flex items-center gap-2
          ${open ? 'border-qt-green' : 'border-qt-gray-dark'}`}
      >
        {selected ? (
          <>
            <span className="text-xs font-bold tracking-wider uppercase">{selected.label}</span>
            {selected.badge && (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-qt-green text-white leading-none">
                {selected.badge}
              </span>
            )}
          </>
        ) : (
          <span className="text-qt-secondary italic">Select withdrawal type</span>
        )}
        <ChevronDown
          size={18}
          className={`absolute right-3 top-1/2 -translate-y-1/2 text-qt-secondary transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {open && (
        <div className="border-2 border-qt-border rounded-lg bg-white shadow-lg overflow-hidden animate-[fadeSlideIn_0.15s_ease-out] max-h-[42dvh] overflow-y-auto">
          {options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => {
                onChange(opt.value);
                setOpen(false);
              }}
              className={`w-full min-h-[40px] px-3 py-2 text-left flex items-center gap-2 cursor-pointer transition-colors active:bg-qt-bg-3
                ${value === opt.value ? 'bg-qt-green-bg/30' : 'hover:bg-qt-bg-3'}`}
            >
              <span className="text-xs font-bold tracking-wider uppercase text-qt-primary">{opt.label}</span>
              {opt.badge && (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-qt-green text-white leading-none">
                  {opt.badge}
                </span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
