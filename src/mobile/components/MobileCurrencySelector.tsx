import type { Currency } from '../../types';
import { formatCurrency } from '../../data/accounts';

interface MobileCurrencySelectorProps {
  value: Currency | null;
  onChange: (c: Currency) => void;
  cadAmount: number;
  usdAmount: number;
}

export default function MobileCurrencySelector({ value, onChange, cadAmount, usdAmount }: MobileCurrencySelectorProps) {
  return (
    <div>
      <p className="font-semibold text-sm text-qt-primary mb-3">Select currency</p>
      <div className="flex flex-col gap-3">
        <button
          type="button"
          onClick={() => onChange('CAD')}
          className={`min-h-[72px] p-4 rounded-xl border-2 text-left transition-all cursor-pointer active:scale-[0.99]
            ${value === 'CAD'
              ? 'border-qt-green bg-qt-green-bg/30'
              : 'border-qt-border active:border-qt-gray-dark bg-white'
            }`}
        >
          <p className="text-lg font-bold tracking-wider uppercase mb-1 text-qt-primary">CAD</p>
          <p className="text-sm text-qt-secondary">Withdraw up to {formatCurrency(cadAmount, 'CAD')}</p>
        </button>
        <button
          type="button"
          onClick={() => onChange('USD')}
          className={`min-h-[72px] p-4 rounded-xl border-2 text-left transition-all cursor-pointer active:scale-[0.99]
            ${value === 'USD'
              ? 'border-qt-green bg-qt-green-bg/30'
              : 'border-qt-border active:border-qt-gray-dark bg-white'
            }`}
        >
          <p className="text-lg font-bold tracking-wider uppercase mb-1 text-qt-primary">USD</p>
          <p className="text-sm text-qt-secondary">Withdraw up to {formatCurrency(usdAmount, 'USD')}</p>
        </button>
      </div>
    </div>
  );
}
