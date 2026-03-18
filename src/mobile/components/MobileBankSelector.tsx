import { useState } from 'react';
import { Plus, Building2, Check } from 'lucide-react';
import type { LinkedBank } from '../../types';
import MobileLinkBankModal from './MobileLinkBankModal';

interface MobileBankSelectorProps {
  value: string | null;
  onChange: (bankId: string) => void;
  allBanks: LinkedBank[];
  onBanksChange: (banks: LinkedBank[]) => void;
}

export default function MobileBankSelector({ value, onChange, allBanks, onBanksChange }: MobileBankSelectorProps) {
  const [showModal, setShowModal] = useState(false);

  function handleNewBank(bank: LinkedBank) {
    onBanksChange([...allBanks, bank]);
    onChange(bank.id);
    setShowModal(false);
  }

  return (
    <div>
      <p className="font-semibold text-sm text-qt-primary mb-3">Select bank account for deposit</p>
      <div className="flex flex-col gap-3">
        {allBanks.map((bank) => (
          <button
            key={bank.id}
            type="button"
            onClick={() => onChange(bank.id)}
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
