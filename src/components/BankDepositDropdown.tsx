import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Plus } from 'lucide-react';
import type { LinkedBank } from '../types';
import { getLinkedBankDepositCurrency } from '../data/accounts';
import LinkBankModal from './LinkBankModal';

interface BankDepositDropdownProps {
  value: string | null;
  onChange: (bankId: string) => void;
  allBanks: LinkedBank[];
  onBanksChange: (banks: LinkedBank[]) => void;
  disabled?: boolean;
}

/** Desktop deposit bank picker — same interaction pattern as withdrawal type dropdowns (FHSA / RRSP). */
export default function BankDepositDropdown({
  value,
  onChange,
  allBanks,
  onBanksChange,
  disabled,
}: BankDepositDropdownProps) {
  const [open, setOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);
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
    <div className="flex flex-col gap-1" ref={ref}>
      <label className="font-semibold text-sm text-qt-primary">Bank for deposit</label>
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setOpen((o) => !o)}
        className={`relative w-full min-h-12 rounded-md border bg-white px-4 pr-10 text-left text-sm outline-none transition-colors flex items-center cursor-pointer
          ${disabled ? 'cursor-not-allowed opacity-50 border-qt-gray-dark' : ''}
          ${open && !disabled ? 'border-qt-green' : 'border-qt-gray-dark'}`}
      >
        <div className="min-w-0 flex-1 py-2">
          {selected ? (
            <div className="flex flex-col items-start gap-0.5">
              <span className="font-semibold text-qt-primary truncate w-full">{selected.name}</span>
              <span className="text-xs text-qt-secondary">
                ****{selected.last4} · {getLinkedBankDepositCurrency(selected)}
              </span>
            </div>
          ) : (
            <span className="text-qt-secondary italic">Select bank account for deposit</span>
          )}
        </div>
        <ChevronDown
          size={20}
          className={`absolute right-3 top-1/2 -translate-y-1/2 text-qt-secondary transition-transform shrink-0 pointer-events-none ${
            open ? 'rotate-180' : ''
          }`}
        />
      </button>
      {open && !disabled && (
        <div className="border border-qt-border rounded-md bg-white shadow-lg overflow-hidden flex flex-col max-h-[min(280px,50vh)] animate-[fadeSlideIn_0.15s_ease-out]">
          <div className="overflow-y-auto divide-y divide-qt-border">
            {allBanks.map((b) => {
              const isSelected = value === b.id;
              return (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => {
                    onChange(b.id);
                    setOpen(false);
                  }}
                  className={`w-full px-4 py-3 text-left flex flex-col gap-0.5 cursor-pointer transition-colors
                    ${isSelected ? 'bg-qt-green-bg/30' : 'hover:bg-qt-bg-3'}`}
                >
                  <span className="text-sm font-semibold text-qt-primary">{b.name}</span>
                  <span className="text-xs text-qt-secondary">
                    ****{b.last4} · {getLinkedBankDepositCurrency(b)}
                  </span>
                </button>
              );
            })}
          </div>
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              setShowModal(true);
            }}
            className="flex items-center gap-2 px-4 py-3 border-t border-qt-border text-left text-sm font-semibold text-qt-green-dark hover:bg-qt-bg-3 transition-colors cursor-pointer shrink-0"
          >
            <Plus size={18} className="shrink-0" />
            Link a new account
          </button>
        </div>
      )}
      {showModal && (
        <LinkBankModal
          onClose={() => setShowModal(false)}
          onSave={(bank) => {
            onBanksChange([...allBanks, bank]);
            onChange(bank.id);
            setShowModal(false);
          }}
        />
      )}
    </div>
  );
}
