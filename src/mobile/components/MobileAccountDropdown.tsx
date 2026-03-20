import { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { accounts as defaultAccounts } from '../../data/accounts';
import type { Account } from '../../types';

/** Second line under selected account (matches Questrade-style account picker). */
function accountSubtitle(account: Account): string {
  if (account.type === 'RESP') return 'Family RESP';
  return 'Self-directed Individual';
}

interface MobileAccountDropdownProps {
  /** Defaults to all accounts from `data/accounts`. */
  accounts?: Account[];
  value: string | null;
  onChange: (account: Account) => void;
  /** Label above the field (Figma: "From Questrade account"). */
  fieldLabel?: string;
}

export default function MobileAccountDropdown({
  accounts = defaultAccounts,
  value,
  onChange,
  fieldLabel = 'From Questrade account',
}: MobileAccountDropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const selected = accounts.find((a) => a.id === value);

  return (
    <div className="flex flex-col gap-2" ref={ref}>
      <label className="text-sm font-normal text-figma-neutral-200">{fieldLabel}</label>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`relative flex w-full max-w-[357px] cursor-pointer items-center gap-3 rounded-[length:var(--ads-border-radius-m)] border border-solid bg-[var(--ads-color-elevation-overlay)] py-3.5 pl-4 pr-11 text-left outline-none transition-colors ${
          open ? 'border-qt-green shadow-sm' : 'border-[var(--ads-color-secondary-400)]'
        }`}
      >
        <div className="min-w-0 flex-1">
          {selected ? (
            <>
              <p className="text-sm font-bold leading-snug text-[var(--ads-color-body-contrast-100)]">
                {selected.label} - {selected.accountNumber}
              </p>
              <p className="mt-0.5 text-xs font-normal leading-snug text-figma-neutral-200">
                {accountSubtitle(selected)}
              </p>
            </>
          ) : (
            <p className="text-sm text-figma-neutral-200 italic">Select an account</p>
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
        <div
          className="z-30 flex h-[220px] w-full max-w-[357px] flex-col items-start gap-2 overflow-y-auto rounded-[12px] border border-solid border-[var(--ads-color-secondary-400)] bg-[var(--ads-color-elevation-overlay)] pt-3 pb-5 pl-4 pr-0 shadow-[0_8px_24px_rgba(38,45,51,0.12)] animate-[fadeSlideIn_0.15s_ease-out]"
          role="listbox"
        >
          {accounts.map((a) => {
            const isSelected = value === a.id;
            return (
              <button
                key={a.id}
                type="button"
                role="option"
                aria-selected={isSelected}
                onClick={() => {
                  onChange(a);
                  setOpen(false);
                }}
                className={`flex w-full shrink-0 py-2 text-left text-sm font-bold leading-snug text-[var(--ads-color-body-contrast-100)] transition-colors active:bg-qt-bg-3 ${
                  isSelected ? 'bg-qt-green-bg/70' : 'hover:bg-qt-bg-2'
                }`}
              >
                {a.label} - {a.accountNumber}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
