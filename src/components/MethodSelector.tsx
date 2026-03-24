import type { WithdrawalMethod, Currency } from '../types';
import type { WithdrawalMethodDisableFlags } from '../data/accounts';
import RadioButton from './RadioButton';

interface MethodSelectorProps {
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
    {
      value: 'eft',
      label: 'Electronic Funds Transfer (EFT)',
      description: '0-2 business days \u00b7 No fee',
    },
    {
      value: 'wire',
      label: 'Wire Transfer',
      description: `1-2 business days \u00b7 ${wireFee} fee`,
    },
    {
      value: 'international_wire',
      label: 'International Wire Transfer',
      description: '2+ business days \u00b7 $40 fee',
    },
  ];
}

export default function MethodSelector({
  value,
  onChange,
  currency,
  methodDisabled = defaultDisabled,
}: MethodSelectorProps) {
  return (
    <div>
      <p className="font-semibold text-sm text-qt-primary mb-3">Select withdrawal method</p>
      <div className="flex flex-col gap-3">
        {getMethods(currency).map((m) => {
          const disabled = methodDisabled[m.value];
          return (
            <div
              key={m.value}
              className={`border rounded-lg p-4 transition-all
              ${
                disabled
                  ? 'border-qt-border bg-qt-bg-3 cursor-not-allowed opacity-55'
                  : value === m.value
                    ? 'border-qt-green bg-qt-green-bg/30 cursor-pointer'
                    : 'border-qt-border hover:border-qt-gray-dark cursor-pointer'
              }`}
              onClick={() => {
                if (!disabled) onChange(m.value);
              }}
            >
              <RadioButton
                name="withdrawal-method"
                value={m.value}
                label={m.label}
                description={m.description}
                checked={value === m.value}
                disabled={disabled}
                onChange={() => {
                  if (!disabled) onChange(m.value);
                }}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
