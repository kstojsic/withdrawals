import type { WithdrawalMethod, Currency } from '../../types';
import type { WithdrawalMethodDisableFlags } from '../../data/accounts';

interface MobileMethodSelectorProps {
  value: WithdrawalMethod | null;
  onChange: (m: WithdrawalMethod) => void;
  currency?: Currency | null;
  methodDisabled?: WithdrawalMethodDisableFlags;
}

const defaultDisabled: WithdrawalMethodDisableFlags = {
  eft: false,
  wire: false,
  international_wire: false,
};

function getMethods(currency?: Currency | null): { value: WithdrawalMethod; label: string; description: string }[] {
  const wireFee = currency === 'USD' ? '$30' : '$20';
  return [
    { value: 'eft', label: 'Electronic Funds Transfer (EFT)', description: '0-2 business days · No fee' },
    { value: 'wire', label: 'Wire Transfer', description: `1-2 business days · ${wireFee} fee` },
    { value: 'international_wire', label: 'International Wire Transfer', description: '2+ business days · $40 fee' },
  ];
}

export default function MobileMethodSelector({
  value,
  onChange,
  currency,
  methodDisabled = defaultDisabled,
}: MobileMethodSelectorProps) {
  return (
    <div className="flex flex-1 min-h-0 flex-col">
      <p className="font-semibold text-xs text-qt-primary mb-1.5 shrink-0">Withdrawal method</p>
      <div className="flex flex-col gap-1.5 min-h-0">
        {getMethods(currency).map((m) => {
          const disabled = methodDisabled[m.value];
          return (
            <button
              key={m.value}
              type="button"
              disabled={disabled}
              aria-disabled={disabled}
              onClick={() => {
                if (!disabled) onChange(m.value);
              }}
              className={`min-h-[44px] flex items-center gap-2.5 p-2.5 rounded-lg border-2 text-left transition-all active:scale-[0.99] ${
                disabled
                  ? 'cursor-not-allowed border-qt-border bg-qt-bg-3 opacity-50'
                  : value === m.value
                    ? 'border-qt-green bg-qt-green-bg/30 cursor-pointer'
                    : 'border-qt-border active:border-qt-gray-dark bg-white cursor-pointer'
              }`}
            >
              <div
                className={`size-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                  disabled ? 'border-qt-gray-dark' : value === m.value ? 'border-qt-green' : 'border-qt-gray-dark'
                }`}
              >
                {value === m.value && !disabled && <div className="size-2 rounded-full bg-qt-green" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-xs text-qt-primary leading-tight">{m.label}</p>
                <p className="text-[10px] text-qt-secondary mt-0.5 leading-snug">{m.description}</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
