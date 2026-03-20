import { useState } from 'react';
import { Plus, Building2, Check } from 'lucide-react';
import type { LinkedBank } from '../../types';
import MobileLinkBankModal from './MobileLinkBankModal';

interface MobileBankSelectorProps {
  value: string | null;
  onChange: (bankId: string) => void;
  allBanks: LinkedBank[];
  onBanksChange: (banks: LinkedBank[]) => void;
  /** Pre-linked chip vs new account from modal — drives withdrawal currency UX */
  onSelectionKind?: (kind: 'existing' | 'newly_linked') => void;
  /** Wrapped chips — saves vertical space on small screens */
  variant?: 'default' | 'compact';
}

export default function MobileBankSelector({
  value,
  onChange,
  allBanks,
  onBanksChange,
  onSelectionKind,
  variant = 'compact',
}: MobileBankSelectorProps) {
  const [showModal, setShowModal] = useState(false);

  function handleNewBank(bank: LinkedBank) {
    onSelectionKind?.('newly_linked');
    onBanksChange([...allBanks, bank]);
    onChange(bank.id);
    setShowModal(false);
  }

  if (variant === 'compact') {
    return (
      <div>
        <p className="font-semibold text-[11px] text-qt-primary mb-1">Bank for deposit</p>
        <div className="flex flex-wrap gap-1">
          {allBanks.map((bank) => (
            <button
              key={bank.id}
              type="button"
              onClick={() => {
                onSelectionKind?.('existing');
                onChange(bank.id);
              }}
              className={`flex items-center gap-1.5 min-h-[32px] max-w-full rounded-lg border-2 px-2 py-1 text-left transition-all cursor-pointer active:scale-[0.99]
                ${value === bank.id
                  ? 'border-qt-green bg-qt-green-bg/30'
                  : 'border-qt-border active:border-qt-gray-dark bg-white'
                }`}
            >
              <Building2 size={14} className="text-qt-secondary shrink-0" />
              <span className="min-w-0">
                <span className="block text-xs font-semibold text-qt-primary truncate max-w-[9rem]">{bank.name}</span>
                <span className="text-[10px] text-qt-secondary">••{bank.last4}</span>
              </span>
              {value === bank.id && <Check size={14} className="text-qt-green shrink-0" />}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setShowModal(true)}
            className="flex items-center gap-1.5 min-h-[32px] rounded-lg border-2 border-dashed border-qt-gray-dark px-2 py-1 text-left active:bg-qt-bg-3 transition-all cursor-pointer"
          >
            <Plus size={14} className="text-qt-green-dark shrink-0" />
            <span className="text-xs font-semibold text-qt-green-dark">Add bank</span>
          </button>
        </div>
        {showModal && (
          <MobileLinkBankModal
            onClose={() => setShowModal(false)}
            onSave={handleNewBank}
          />
        )}
      </div>
    );
  }

  return (
    <div>
      <p className="font-semibold text-sm text-qt-primary mb-3">Select bank account for deposit</p>
      <div className="flex flex-col gap-3">
        {allBanks.map((bank) => (
          <button
            key={bank.id}
            type="button"
            onClick={() => {
              onSelectionKind?.('existing');
              onChange(bank.id);
            }}
            className={`min-h-[64px] flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all cursor-pointer active:scale-[0.99] w-full
              ${value === bank.id
                ? 'border-qt-green bg-qt-green-bg/30'
                : 'border-qt-border active:border-qt-gray-dark bg-white'
              }`}
          >
            <div className="size-12 rounded-xl bg-qt-bg-3 flex items-center justify-center shrink-0">
              <Building2 size={20} className="text-qt-secondary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm text-qt-primary">{bank.name}</p>
              <p className="text-xs text-qt-secondary">Account ending in {bank.last4}</p>
            </div>
            {value === bank.id && (
              <Check size={24} className="text-qt-green shrink-0" />
            )}
          </button>
        ))}

        <button
          type="button"
          onClick={() => setShowModal(true)}
          className="min-h-[64px] flex items-center gap-4 p-4 rounded-xl border-2 border-dashed border-qt-gray-dark text-left active:bg-qt-bg-3 transition-all cursor-pointer w-full"
        >
          <div className="size-12 rounded-xl bg-qt-bg-3 flex items-center justify-center shrink-0">
            <Plus size={20} className="text-qt-green-dark" />
          </div>
          <p className="font-semibold text-sm text-qt-green-dark">Connect a new bank account</p>
        </button>
      </div>

      {showModal && (
        <MobileLinkBankModal
          onClose={() => setShowModal(false)}
          onSave={handleNewBank}
        />
      )}
    </div>
  );
}
