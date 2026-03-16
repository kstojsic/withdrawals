import type { WithdrawalMethod, Currency } from '../types';
import RadioButton from './RadioButton';

interface MethodSelectorProps {
  value: WithdrawalMethod | null;
  onChange: (m: WithdrawalMethod) => void;
  currency?: Currency | null;
}

function getMethods(currency?: Currency | null): { value: WithdrawalMethod; label: string; description: string }[] {
  const wireFee = currency === 'USD' ? '$30' : '$20';
  return [
    {
      value: 'eft',
      label: 'Electronic Funds Transfer (EFT)',
      description: '0-3 business days \u00b7 No fee',
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

export default function MethodSelector({ value, onChange, currency }: MethodSelectorProps) {
  return (
    <div>
      <p className="font-semibold text-sm text-qt-primary mb-3">Select withdrawal method</p>
      <div className="flex flex-col gap-3">
        {getMethods(currency).map((m) => (
          <div
            key={m.value}
            className={`border rounded-lg p-4 cursor-pointer transition-all
              ${value === m.value
                ? 'border-qt-green bg-qt-green-bg/30'
                : 'border-qt-border hover:border-qt-gray-dark'
              }`}
            onClick={() => onChange(m.value)}
          >
            <RadioButton
              name="withdrawal-method"
              value={m.value}
              label={m.label}
              description={m.description}
              checked={value === m.value}
              onChange={() => onChange(m.value)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
