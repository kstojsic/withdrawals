import { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import type { WithdrawalMethod, Currency } from '../../types';

function feeHint(method: WithdrawalMethod, currency: Currency | null): string {
  if (method === 'eft') return 'No fee · 0–3 business days';
  if (method === 'wire') return `${currency === 'USD' ? '$30' : '$20'} fee · 1–2 business days`;
  return '$40 fee · 2+ business days';
}

const METHODS: { value: WithdrawalMethod; label: string }[] = [
  { value: 'eft', label: 'Electronic Funds Transfer (EFT)' },
  { value: 'wire', label: 'Wire transfer' },
  { value: 'international_wire', label: 'International wire transfer' },
];

const triggerBase =
  'relative flex w-full max-w-[357px] cursor-pointer items-center gap-3 rounded-[length:var(--ads-border-radius-m)] border border-solid bg-[var(--ads-color-elevation-overlay)] py-3.5 pl-4 pr-11 text-left outline-none transition-colors';

const panelShell =
  'z-30 flex h-[220px] w-full max-w-[357px] flex-col overflow-hidden rounded-[length:var(--ads-border-radius-m)] border border-solid border-[var(--ads-color-secondary-400)] bg-[var(--ads-color-elevation-overlay)] pt-3 pl-4 shadow-[0_8px_24px_rgba(38,45,51,0.12)] animate-[fadeSlideIn_0.15s_ease-out]';

interface MobileWithdrawalMethodDropdownProps {
  value: WithdrawalMethod;
  onChange: (m: WithdrawalMethod) => void;
  currencyHint?: Currency | null;
}

export default function MobileWithdrawalMethodDropdown({
  value,
  onChange,
  currencyHint = 'CAD',
}: MobileWithdrawalMethodDropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const selected = METHODS.find((m) => m.value === value) ?? METHODS[0];

  return (
    <div className="flex flex-col gap-2" ref={ref}>
      <label className="text-sm font-normal text-figma-neutral-200" htmlFor="mobile-withdrawal-method-trigger">
        Withdrawal method
      </label>
      <button
        id="mobile-withdrawal-method-trigger"
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="listbox"
        className={`${triggerBase} ${open ? 'border-qt-green shadow-sm' : 'border-[var(--ads-color-secondary-400)]'}`}
      >
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold leading-snug text-[var(--ads-color-body-contrast-100)]">{selected.label}</p>
          <p className="mt-0.5 text-xs font-normal leading-snug text-figma-neutral-200">
            {feeHint(value, currencyHint)}
          </p>
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
        <div className={panelShell} role="listbox" aria-labelledby="mobile-withdrawal-method-trigger">
          <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto pr-1 pb-5">
            {METHODS.map((m) => {
              const isSelected = value === m.value;
              return (
                <button
                  key={m.value}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => {
                    onChange(m.value);
                    setOpen(false);
                  }}
                  className={`flex w-full shrink-0 flex-col items-start gap-0.5 py-2 text-left transition-colors active:bg-qt-bg-3 ${
                    isSelected ? 'bg-qt-green-bg/70' : 'hover:bg-qt-bg-2'
                  }`}
                >
                  <span className="text-sm font-bold leading-snug text-[var(--ads-color-body-contrast-100)]">
                    {m.label}
                  </span>
                  <span className="text-xs font-normal leading-snug text-figma-neutral-200">
                    {feeHint(m.value, currencyHint)}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
