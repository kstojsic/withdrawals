import { useState } from 'react';
import { Plus, Building2, Check } from 'lucide-react';
import type { LinkedBank } from '../types';
import LinkBankModal from './LinkBankModal';

interface BankSelectorProps {
  value: string | null;
  onChange: (bankId: string) => void;
  allBanks: LinkedBank[];
  onBanksChange: (banks: LinkedBank[]) => void;
}

export default function BankSelector({ value, onChange, allBanks, onBanksChange }: BankSelectorProps) {
  const [showModal, setShowModal] = useState(false);

  function handleNewBank(bank: LinkedBank) {
    onBanksChange([...allBanks, bank]);
    onChange(bank.id);
    setShowModal(false);
  }

  return (
    <div>
      <p className="font-semibold text-sm text-qt-primary mb-3">Select bank account</p>
      <div className="flex flex-col gap-2">
        {allBanks.map((bank) => (
          <button
            key={bank.id}
            type="button"
            onClick={() => onChange(bank.id)}
            className={`flex items-center gap-3 p-4 rounded-lg border text-left transition-all cursor-pointer w-full
              ${value === bank.id
                ? 'border-qt-green bg-qt-green-bg/30'
                : 'border-qt-border hover:border-qt-gray-dark bg-white'
              }`}
          >
            <div className="size-10 rounded-full bg-qt-bg-3 flex items-center justify-center shrink-0">
              <Building2 size={18} className="text-qt-secondary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm text-qt-primary">{bank.name}</p>
              <p className="text-xs text-qt-secondary">Account ending in {bank.last4}</p>
            </div>
            {value === bank.id && (
              <Check size={20} className="text-qt-green shrink-0" />
            )}
          </button>
        ))}

        <button
          type="button"
          onClick={() => setShowModal(true)}
          className="flex items-center gap-3 p-4 rounded-lg border border-dashed border-qt-gray-dark text-left hover:bg-qt-bg-3 transition-all cursor-pointer w-full"
        >
          <div className="size-10 rounded-full bg-qt-bg-3 flex items-center justify-center shrink-0">
            <Plus size={18} className="text-qt-green-dark" />
          </div>
          <p className="font-semibold text-sm text-qt-green-dark">Connect a new bank account</p>
        </button>
      </div>

      {showModal && (
        <LinkBankModal
          onClose={() => setShowModal(false)}
          onSave={handleNewBank}
        />
      )}
    </div>
  );
}
