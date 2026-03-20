import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Plus } from 'lucide-react';
import type { LinkedBank } from '../../types';
import { getLinkedBankDepositCurrency } from '../../data/accounts';
import MobileLinkBankModal from './MobileLinkBankModal';

interface MobileBankDepositDropdownProps {
  value: string | null;
  onChange: (bankId: string) => void;
  allBanks: LinkedBank[];
  onBanksChange: (banks: LinkedBank[]) => void;
  disabled?: boolean;
}

/** Panel + trigger styles aligned with `MobileAccountDropdown`. */
const triggerBase =
  'relative flex w-full max-w-[357px] cursor-pointer items-center gap-3 rounded-[length:var(--ads-border-radius-m)] border border-solid bg-[var(--ads-color-elevation-overlay)] py-3.5 pl-4 pr-11 text-left outline-none transition-colors';

const panelShell =
  'z-30 flex h-[220px] w-full max-w-[357px] flex-col overflow-hidden rounded-[length:var(--ads-border-radius-m)] border border-solid border-[var(--ads-color-secondary-400)] bg-[var(--ads-color-elevation-overlay)] pt-3 pl-4 shadow-[0_8px_24px_rgba(38,45,51,0.12)] animate-[fadeSlideIn_0.15s_ease-out]';

export default function MobileBankDepositDropdown({
  value,
  onChange,
  allBanks,
  onBanksChange,
  disabled,
}: MobileBankDepositDropdownProps) {
  const [open, setOpen] = useState(false);
  const [showLink, setShowLink] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const selected = allBanks.find((b) => b.id === value);

  return (
    <div className="flex flex-col gap-2" ref={ref}>
      <label className="text-sm font-normal text-figma-neutral-200">Bank for deposit</label>
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setOpen((o) => !o)}
        className={`${triggerBase} ${disabled ? 'cursor-not-allowed opacity-50' : ''} ${
          open && !disabled ? 'border-qt-green shadow-sm' : 'border-[var(--ads-color-secondary-400)]'
        }`}
      >
        <div className="min-w-0 flex-1">
          {selected ? (
            <>
              <p className="text-sm font-bold leading-snug text-[var(--ads-color-body-contrast-100)]">
                {selected.name} - {selected.accountNumber}
              </p>
              <p className="mt-0.5 text-xs font-normal leading-snug text-figma-neutral-200">
                ••••{selected.last4} · {getLinkedBankDepositCurrency(selected)}
              </p>
            </>
          ) : (
            <p className="text-sm text-figma-neutral-200 italic">Select bank account</p>
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
      {open && !disabled && (
        <div className={panelShell} role="listbox">
          <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto pr-1 pb-2">
            {allBanks.map((b) => {
              const isSelected = value === b.id;
              return (
                <button
                  key={b.id}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => {
                    onChange(b.id);
                    setOpen(false);
                  }}
                  className={`flex w-full shrink-0 flex-col items-start gap-0.5 py-2 text-left transition-colors active:bg-qt-bg-3 ${
                    isSelected ? 'bg-qt-green-bg/70' : 'hover:bg-qt-bg-2'
                  }`}
                >
                  <span className="text-sm font-bold leading-snug text-[var(--ads-color-body-contrast-100)]">
                    {b.name} - {b.accountNumber}
                  </span>
                  <span className="text-xs font-normal leading-snug text-figma-neutral-200">
                    ••••{b.last4} · {getLinkedBankDepositCurrency(b)}
                  </span>
                </button>
              );
            })}
          </div>
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              setShowLink(true);
            }}
            className="flex w-full shrink-0 items-center gap-2 border-t border-solid border-[var(--ads-color-secondary-400)] py-3 text-left text-sm font-bold text-qt-green-dark active:bg-qt-green-bg/30"
          >
            <Plus size={18} className="shrink-0" />
            Link a new account
          </button>
        </div>
      )}
      {showLink && (
        <MobileLinkBankModal
          onClose={() => setShowLink(false)}
          onSave={(bank) => {
            onBanksChange([...allBanks, bank]);
            onChange(bank.id);
            setShowLink(false);
          }}
        />
      )}
    </div>
  );
}
