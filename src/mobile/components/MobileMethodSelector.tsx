import type { WithdrawalMethod, Currency } from '../../types';

interface MobileMethodSelectorProps {
  value: WithdrawalMethod | null;
  onChange: (m: WithdrawalMethod) => void;
  currency?: Currency | null;
}

function getMethods(currency?: Currency | null): { value: WithdrawalMethod; label: string; description: string }[] {
  const wireFee = currency === 'USD' ? '$30' : '$20';
  return [
    { value: 'eft', label: 'Electronic Funds Transfer (EFT)', description: '0-3 business days · No fee' },
    { value: 'wire', label: 'Wire Transfer', description: `1-2 business days · ${wireFee} fee` },
    { value: 'international_wire', label: 'International Wire Transfer', description: '2+ business days · $40 fee' },
  ];
}

export default function MobileMethodSelector({ value, onChange, currency }: MobileMethodSelectorProps) {
  return (
    <div>
      <p className="font-semibold text-sm text-qt-primary mb-3">Select withdrawal method</p>
      <div className="flex flex-col gap-3">
        {getMethods(currency).map((m) => (
          <button
            key={m.value}
            type="button"
            onClick={() => onChange(m.value)}
            className={`min-h-[64px] flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all cursor-pointer active:scale-[0.99]
              ${value === m.value
                ? 'border-qt-green bg-qt-green-bg/30'
                : 'border-qt-border active:border-qt-gray-dark bg-white'
              }`}
          >
            <div className={`size-5 rounded-full border-2 flex items-center justify-center shrink-0
              ${value === m.value ? 'border-qt-green' : 'border-qt-gray-dark'}`}>
              {value === m.value && <div className="size-2.5 rounded-full bg-qt-green" />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm text-qt-primary">{m.label}</p>
              <p className="text-xs text-qt-secondary mt-0.5">{m.description}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
