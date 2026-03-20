import type { Currency } from '../../types';
import { formatCurrency } from '../../data/accounts';

interface MobileCurrencySelectorProps {
  value: Currency | null;
  onChange: (c: Currency) => void;
  cadAmount: number;
  usdAmount: number;
  /** Tighter layout for first wizard step on small phones */
  compact?: boolean;
}

export default function MobileCurrencySelector({
  value,
  onChange,
  cadAmount,
  usdAmount,
  compact = false,
}: MobileCurrencySelectorProps) {
  const pad = compact ? 'p-1.5' : 'p-2.5';
  const title = compact ? 'text-[11px] mb-1' : 'text-xs mb-1.5';
  const label = compact ? 'text-xs' : 'text-sm';
  const gap = compact ? 'gap-1.5' : 'gap-2';

  return (
    <div>
      <p className={`font-semibold text-qt-primary ${title}`}>Currency</p>
      <div className={`grid grid-cols-2 ${gap}`}>
        <button
          type="button"
          onClick={() => onChange('CAD')}
          className={`min-h-0 rounded-lg border-2 ${pad} text-left transition-all cursor-pointer active:scale-[0.99]
            ${value === 'CAD'
              ? 'border-qt-green bg-qt-green-bg/30'
              : 'border-qt-border active:border-qt-gray-dark bg-white'
            }`}
        >
          <p className={`${label} font-bold tracking-wider uppercase text-qt-primary`}>CAD</p>
          <p className="text-[10px] text-qt-secondary leading-tight mt-0.5">Max {formatCurrency(cadAmount, 'CAD')}</p>
        </button>
        <button
          type="button"
          onClick={() => onChange('USD')}
          className={`min-h-0 rounded-lg border-2 ${pad} text-left transition-all cursor-pointer active:scale-[0.99]
            ${value === 'USD'
              ? 'border-qt-green bg-qt-green-bg/30'
              : 'border-qt-border active:border-qt-gray-dark bg-white'
            }`}
        >
          <p className={`${label} font-bold tracking-wider uppercase text-qt-primary`}>USD</p>
          <p className="text-[10px] text-qt-secondary leading-tight mt-0.5">Max {formatCurrency(usdAmount, 'USD')}</p>
        </button>
      </div>
    </div>
  );
}
