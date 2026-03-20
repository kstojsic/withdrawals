import { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

export interface MobileWithdrawalTypeOption<T extends string> {
  value: T;
  label: string;
  /** Green pill (e.g. “Taxable”) — same as legacy mobile withdrawal type control */
  badge?: string;
}

interface MobileWithdrawalTypeDropdownProps<T extends string> {
  label?: string;
  options: MobileWithdrawalTypeOption<T>[];
  value: T | '';
  onChange: (v: T) => void;
}

function TaxableBadge({ text }: { text: string }) {
  return (
    <span className="inline-flex shrink-0 items-center rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider leading-none bg-qt-green text-white">
      {text}
    </span>
  );
}

/** Trigger matches bank/method ADS shell; panel is content-sized (no tall empty block). */
const triggerBase =
  'relative flex w-full max-w-[357px] cursor-pointer items-center gap-3 rounded-[length:var(--ads-border-radius-m)] border border-solid bg-[var(--ads-color-elevation-overlay)] py-3 pl-3.5 pr-11 text-left outline-none transition-colors';

const panelShell =
  'z-30 flex max-h-[min(200px,45dvh)] w-full max-w-[357px] flex-col overflow-hidden rounded-[length:var(--ads-border-radius-m)] border border-solid border-[var(--ads-color-secondary-400)] bg-[var(--ads-color-elevation-overlay)] py-2 pl-3 pr-1 shadow-[0_8px_24px_rgba(38,45,51,0.12)] animate-[fadeSlideIn_0.15s_ease-out]';

const triggerId = 'mobile-withdrawal-type-trigger';

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
    <div className="flex flex-col gap-1.5" ref={ref}>
      <label className="text-sm font-normal text-figma-neutral-200" htmlFor={triggerId}>
        {label}
      </label>
      <button
        id={triggerId}
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="listbox"
        className={`${triggerBase} ${open ? 'border-qt-green shadow-sm' : 'border-[var(--ads-color-secondary-400)]'}`}
      >
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
          {selected ? (
            <>
              <p className="text-sm font-bold leading-snug text-[var(--ads-color-body-contrast-100)]">{selected.label}</p>
              {selected.badge ? <TaxableBadge text={selected.badge} /> : null}
            </>
          ) : (
            <p className="text-sm font-normal italic leading-snug text-figma-neutral-200">Select withdrawal type</p>
          )}
        </div>
        <ChevronDown
          size={20}
          strokeWidth={2}
          className={`pointer-events-none absolute right-3.5 top-1/2 shrink-0 -translate-y-1/2 text-figma-neutral-200 transition-transform duration-200 ${
            open ? 'rotate-180' : ''
          }`}
          aria-hidden
        />
      </button>
      {open && (
        <div className={panelShell} role="listbox" aria-labelledby={triggerId}>
          <div className="flex min-h-0 flex-1 flex-col gap-0.5 overflow-y-auto pr-1 pb-1">
            {options.map((opt) => {
              const isSelected = value === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => {
                    onChange(opt.value);
                    setOpen(false);
                  }}
                  className={`flex w-full shrink-0 flex-wrap items-center gap-2 py-1.5 text-left transition-colors active:bg-qt-bg-3 ${
                    isSelected ? 'bg-qt-green-bg/70' : 'hover:bg-qt-bg-2'
                  }`}
                >
                  <span className="min-w-0 text-sm font-bold leading-snug text-[var(--ads-color-body-contrast-100)]">
                    {opt.label}
                  </span>
                  {opt.badge ? <TaxableBadge text={opt.badge} /> : null}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
