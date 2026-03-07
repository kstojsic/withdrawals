import type { Currency } from '../types';
import { formatCurrency } from '../data/accounts';

interface CurrencySelectorProps {
  value: Currency | null;
  onChange: (c: Currency) => void;
  cadAmount: number;
  usdAmount: number;
}

export default function CurrencySelector({ value, onChange, cadAmount, usdAmount }: CurrencySelectorProps) {
  return (
    <div>
      <p className="font-semibold text-sm text-qt-primary mb-3">Select currency</p>
      <div className="grid grid-cols-2 gap-3">
        <CurrencyBox
          label="Combined CAD"
          currency="CAD"
          amount={cadAmount}
          selected={value === 'CAD'}
          onClick={() => onChange('CAD')}
        />
        <CurrencyBox
          label="Combined USD"
          currency="USD"
          amount={usdAmount}
          selected={value === 'USD'}
          onClick={() => onChange('USD')}
        />
      </div>
    </div>
  );
}

function CurrencyBox({
  label,
  currency,
  amount,
  selected,
  onClick,
}: {
  label: string;
  currency: Currency;
  amount: number;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`p-4 rounded-lg border-2 text-left transition-all cursor-pointer
        ${selected
          ? 'border-qt-green bg-qt-green-bg/30'
          : 'border-qt-border hover:border-qt-gray-dark bg-white'
        }`}
    >
      <p className={`text-xs font-bold tracking-wider uppercase mb-1 ${selected ? 'text-qt-green-dark' : 'text-qt-secondary'}`}>
        {label}
      </p>
      <p className="text-lg font-semibold text-qt-primary">
        {formatCurrency(amount, currency)}
      </p>
    </button>
  );
}
