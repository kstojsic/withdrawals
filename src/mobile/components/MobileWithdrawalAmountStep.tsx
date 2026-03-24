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

export function currencySymbolForWithdrawal(currency: string): string {
  return currency.toUpperCase() === 'USD' ? 'US$' : 'CA$';
}

export interface MobileWithdrawalAmountFieldProps {
  primaryCurrency: string;
  value: string;
  onChange: (raw: string) => void;
  /** Defaults to `Enter amount (CAD)` / `Enter amount (USD)` style */
  label?: string;
  max?: number;
  maxLabel?: string;
  error?: string;
  /** Show conversion hint when amount exceeds primary-currency cash only */
  showPrimaryExceedsConversionHint?: boolean;
  primaryAvailableBalance?: number;
  inputId?: string;
}

/**
 * Single-line amount control matching Standard / FHSA mobile (`Enter amount` + CA$/US$ + ADS border).
 */
export function MobileWithdrawalAmountField({
  primaryCurrency,
  value,
  onChange,
  label,
  max,
  maxLabel,
  error,
  showPrimaryExceedsConversionHint = false,
  primaryAvailableBalance = 0,
  inputId = 'withdrawal-amount-input',
}: MobileWithdrawalAmountFieldProps) {
  const primary = primaryCurrency.toUpperCase();
  const displayLabel = label ?? `Enter amount (${primary})`;

  const [display, setDisplay] = useState(() => (value ? formatAmountDisplay(value) : ''));
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    if (!focused) {
      setDisplay(value ? formatAmountDisplay(value) : '');
    }
  }, [value, focused]);

  const handleBlur = useCallback(() => {
    setFocused(false);
    let stripped = stripFormatting(display);
    let num = parseFloat(stripped);
    if (stripped === '' || Number.isNaN(num)) {
      setDisplay('');
      onChange('');
      return;
    }
    if (max !== undefined && num > max) {
      stripped = max.toString();
      num = max;
      onChange(stripped);
      setDisplay(formatAmountDisplay(stripped));
      return;
    }
    onChange(stripped);
    setDisplay(formatAmountDisplay(stripped));
  }, [display, max, onChange]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const v = e.target.value;
      if (v === '' || /^[0-9]*\.?[0-9]*$/.test(v)) {
        setDisplay(v);
        onChange(stripFormatting(v));
      }
    },
    [onChange],
  );

  const parsedAmount = parseFloat(stripFormatting(display)) || 0;
  const exceedsPrimary =
    showPrimaryExceedsConversionHint &&
    parsedAmount > primaryAvailableBalance &&
    parsedAmount > 0;
  const maxBreached = max !== undefined && parsedAmount > max && parsedAmount > 0;

  return (
    <div className="flex w-full flex-col gap-2">
      <label htmlFor={inputId} className="text-sm font-semibold text-qt-primary">
        {displayLabel}
      </label>
      <div
        className={`flex min-h-[48px] items-center gap-2 rounded-[length:var(--ads-border-radius-m)] border border-solid px-3 transition-colors ${
          focused ? 'border-qt-green' : maxBreached || error ? 'border-qt-red' : 'border-[var(--ads-color-secondary-400)]'
        }`}
      >
        <span className="text-base font-medium text-qt-secondary tabular-nums" aria-hidden>
          {currencySymbolForWithdrawal(primary)}
        </span>
        <input
          id={inputId}
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
      {maxBreached && maxLabel && (
        <p className="text-sm font-semibold text-qt-red">
          Your request has exceeded the limit of {maxLabel}
        </p>
      )}
      {error && !maxBreached && <p className="text-sm font-semibold text-qt-red">{error}</p>}
      {exceedsPrimary && (
        <div
          className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-3 text-[11px] leading-relaxed text-amber-950"
          role="status"
        >
          Your request exceeds your {primary} balance. An automatic currency conversion will be applied to cover the
          difference.
        </div>
      )}
    </div>
  );
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

      <MobileWithdrawalAmountField
        primaryCurrency={primaryCurrency}
        value={raw}
        onChange={setRaw}
        showPrimaryExceedsConversionHint
        primaryAvailableBalance={availableBalance}
        inputId="withdrawal-amount-input"
      />
    </div>
  );
}
