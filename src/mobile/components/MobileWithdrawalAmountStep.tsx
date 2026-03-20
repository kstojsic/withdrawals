import { useCallback, useEffect, useState } from 'react';
import { formatAmountDisplay, stripFormatting } from '../../data/accounts';
import MobileWithdrawAvailableSummary from './MobileWithdrawAvailableSummary';

export interface MobileWithdrawalAmountStepProps {
  primaryCurrency: string;
  availableBalance: number;
  unavailableBalance: number;
  secondaryCurrency?: string;
  secondaryBalance?: number;
  maxFromSecondaryInPrimary?: number;
  combinedMaxInPrimary?: number;
  amount?: string;
  onAmountChange?: (raw: string) => void;
}

function currencySymbol(currency: string): string {
  return currency.toUpperCase() === 'USD' ? 'US$' : 'CA$';
}

export default function MobileWithdrawalAmountStep({
  primaryCurrency,
  availableBalance,
  unavailableBalance,
  secondaryCurrency,
  secondaryBalance,
  maxFromSecondaryInPrimary,
  combinedMaxInPrimary,
  amount: controlledAmount,
  onAmountChange,
}: MobileWithdrawalAmountStepProps) {
  const isControlled = controlledAmount !== undefined && onAmountChange !== undefined;
  const [internalRaw, setInternalRaw] = useState('');
  const raw = isControlled ? controlledAmount! : internalRaw;
  const setRaw = isControlled ? onAmountChange! : setInternalRaw;

  const [display, setDisplay] = useState(() => (raw ? formatAmountDisplay(raw) : ''));
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    if (!focused) setDisplay(raw ? formatAmountDisplay(raw) : '');
  }, [raw, focused]);

  const parsedAmount = parseFloat(stripFormatting(display)) || 0;
  const exceedsPrimary = parsedAmount > availableBalance && parsedAmount > 0;

  const handleBlur = useCallback(() => {
    setFocused(false);
    const stripped = stripFormatting(display);
    const num = parseFloat(stripped);
    if (stripped === '' || Number.isNaN(num)) {
      setDisplay('');
      setRaw('');
      return;
    }
    setRaw(stripped);
    setDisplay(formatAmountDisplay(stripped));
  }, [display, setRaw]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const v = e.target.value;
      if (v === '' || /^[0-9]*\.?[0-9]*$/.test(v)) {
        setDisplay(v);
        setRaw(stripFormatting(v));
      }
    },
    [setRaw],
  );

  const primary = primaryCurrency.toUpperCase();

  return (
    <div className="flex w-full max-w-[357px] flex-col gap-4">
      <MobileWithdrawAvailableSummary
        primaryCurrency={primaryCurrency}
        availableBalance={availableBalance}
        unavailableBalance={unavailableBalance}
        secondaryCurrency={secondaryCurrency}
        secondaryBalance={secondaryBalance}
        maxFromSecondaryInPrimary={maxFromSecondaryInPrimary}
        combinedMaxInPrimary={combinedMaxInPrimary}
      />

      <div className="flex flex-col gap-2">
        <label htmlFor="withdrawal-amount-input" className="text-sm font-semibold text-qt-primary">
          Enter amount ({primary})
        </label>
        <div
          className={`flex min-h-[48px] items-center gap-2 rounded-[length:var(--ads-border-radius-m)] border border-solid px-3 transition-colors ${
            focused ? 'border-qt-green' : 'border-[var(--ads-color-secondary-400)]'
          }`}
        >
          <span className="text-base font-medium text-qt-secondary tabular-nums" aria-hidden>
            {currencySymbol(primary)}
          </span>
          <input
            id="withdrawal-amount-input"
            type="text"
            inputMode="decimal"
            autoComplete="off"
            placeholder="0.00"
            value={display}
            onChange={handleChange}
            onFocus={() => {
              setFocused(true);
              setDisplay(stripFormatting(display));
            }}
            onBlur={handleBlur}
            className="min-w-0 flex-1 border-0 bg-transparent p-0 text-[18px] font-semibold leading-6 text-qt-primary outline-none placeholder:text-qt-border placeholder:italic tabular-nums"
          />
        </div>
      </div>

      {exceedsPrimary && (
        <div
          className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-3 text-[11px] leading-relaxed text-amber-950"
          role="status"
        >
          Your request exceeds your {primary} balance. An automatic currency conversion will be applied to
          cover the difference.
        </div>
      )}
    </div>
  );
}
