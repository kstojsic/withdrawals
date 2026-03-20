import { useCallback, useEffect, useId, useState } from 'react';
import MobileButton from './MobileButton';
import { formatAmountDisplay, formatCurrency, stripFormatting } from '../../data/accounts';

const WHY_UNAVAILABLE_COPY =
  'Funds may be unavailable due to unsettled trades, open orders, or pending deposits. These will be released once settled — typically within 1 business day.';

export interface MobileWithdrawalAmountStepProps {
  primaryCurrency: string;
  availableBalance: number;
  unavailableBalance: number;
  secondaryCurrency?: string;
  secondaryBalance?: number;
  /** Secondary leg converted into primary currency (e.g. USD → CAD). */
  maxFromSecondaryInPrimary?: number;
  /** Total withdrawable when using primary + converted secondary. */
  combinedMaxInPrimary?: number;
  onContinue: (amount: number) => void;
  /** Controlled amount string (digits / one decimal) for wizard state */
  amount?: string;
  onAmountChange?: (raw: string) => void;
}

function currencySymbol(currency: string): string {
  return currency.toUpperCase() === 'USD' ? 'US$' : 'CA$';
}

/** e.g. `USD $12,840.25` / `CAD $62,300.33` (matches design copy). */
function formatWithCurrencyCode(currency: 'CAD' | 'USD', amount: number): string {
  const formatted = amount.toLocaleString('en-CA', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${currency} $${formatted}`;
}

export default function MobileWithdrawalAmountStep({
  primaryCurrency,
  availableBalance,
  unavailableBalance,
  secondaryCurrency,
  secondaryBalance,
  maxFromSecondaryInPrimary,
  combinedMaxInPrimary,
  onContinue,
  amount: controlledAmount,
  onAmountChange,
}: MobileWithdrawalAmountStepProps) {
  const isControlled = controlledAmount !== undefined && onAmountChange !== undefined;
  const [internalRaw, setInternalRaw] = useState('');
  const raw = isControlled ? controlledAmount! : internalRaw;
  const setRaw = isControlled ? onAmountChange! : setInternalRaw;

  const [display, setDisplay] = useState(() => (raw ? formatAmountDisplay(raw) : ''));
  const [focused, setFocused] = useState(false);
  const [whyOpen, setWhyOpen] = useState(false);
  const whyRegionId = useId();

  useEffect(() => {
    if (!focused) setDisplay(raw ? formatAmountDisplay(raw) : '');
  }, [raw, focused]);

  const parsedAmount = parseFloat(stripFormatting(display)) || 0;
  const exceedsPrimary = parsedAmount > availableBalance && parsedAmount > 0;
  const canContinue = parsedAmount > 0;

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

  const handleContinue = useCallback(() => {
    if (!canContinue) return;
    onContinue(parsedAmount);
  }, [canContinue, onContinue, parsedAmount]);

  const primary = primaryCurrency.toUpperCase();
  const hasConversionLine =
    secondaryCurrency != null &&
    secondaryBalance != null &&
    maxFromSecondaryInPrimary != null &&
    combinedMaxInPrimary != null &&
    secondaryBalance > 0;

  const primaryCode = primary as 'CAD' | 'USD';
  const secondaryCode = (secondaryCurrency?.toUpperCase() ?? 'USD') as 'CAD' | 'USD';

  return (
    <div className="flex w-full max-w-[357px] flex-col gap-4">
      {/* Balance card — same row layout as reference, light Questrade / ADS surface */}
      <div>
        <div className="overflow-hidden rounded-2xl border border-solid border-[var(--ads-color-secondary-400)] bg-[var(--ads-color-elevation-overlay)] px-4 py-4 shadow-sm">
          {/* Top row: label left, large balance right */}
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-medium text-qt-secondary">Available in {primary}</p>
            <p className="text-right text-[22px] font-bold leading-tight tracking-tight text-qt-primary tabular-nums">
              {formatCurrency(availableBalance, primaryCode)}
            </p>
          </div>
          <div className="my-3 h-px w-full bg-figma-neutral-100" aria-hidden />
          {/* Bottom row: smaller unavailable left, outlined Why? right */}
          <div className="flex items-center justify-between gap-3">
            <p className="text-[11px] font-medium leading-snug text-qt-secondary tabular-nums">
              {formatCurrency(unavailableBalance, primaryCode)}{' '}
              <span className="text-qt-gray-dark">unavailable</span>
            </p>
            <button
              type="button"
              className="shrink-0 rounded-full border border-solid border-[var(--ads-color-secondary-400)] bg-transparent px-3 py-1 text-[11px] font-semibold text-qt-primary transition-colors hover:bg-qt-bg-3 active:bg-qt-bg-3"
              aria-expanded={whyOpen}
              aria-controls={whyRegionId}
              onClick={() => setWhyOpen((o) => !o)}
            >
              Why?
            </button>
          </div>
        </div>
        {whyOpen && (
          <p
            id={whyRegionId}
            role="region"
            className="mt-2 rounded-lg border border-figma-neutral-100 bg-qt-bg-3 px-3 py-2.5 text-[11px] leading-snug text-qt-secondary"
          >
            {WHY_UNAVAILABLE_COPY}
          </p>
        )}
      </div>

      {/* Conversion summary */}
      {hasConversionLine && (
        <div className="text-[11px] leading-relaxed text-qt-secondary">
          <p className="font-semibold text-qt-primary">Available for conversion</p>
          <p className="mt-1.5 tabular-nums">
            {formatWithCurrencyCode(secondaryCode, secondaryBalance!)}{' '}
            <span className="text-qt-gray-dark">≈</span>{' '}
            {formatWithCurrencyCode(primaryCode, maxFromSecondaryInPrimary!)}
          </p>
          <p className="mt-2 font-medium text-qt-primary">
            Total available to withdraw:{' '}
            <span className="tabular-nums">{formatWithCurrencyCode(primaryCode, combinedMaxInPrimary!)}</span>
          </p>
        </div>
      )}

      {/* Amount */}
      <div className="flex flex-col gap-2">
        <label
          htmlFor="withdrawal-amount-input"
          className="text-sm font-semibold text-qt-primary"
        >
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

      {/* Informational disclosure — only after amount exceeds primary-currency balance */}
      {exceedsPrimary && (
        <div
          className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-3 text-[11px] leading-relaxed text-amber-950"
          role="status"
        >
          Your request exceeds your {primary} balance. An automatic currency conversion will be applied to
          cover the difference.
        </div>
      )}

      <MobileButton
        type="button"
        disabled={!canContinue}
        fullWidth
        className="!h-[length:var(--ads-size-xl)] !min-h-[length:var(--ads-size-xl)] !gap-[length:var(--ads-size-nano)] !rounded-[length:var(--ads-border-radius-xl)] !bg-[var(--ads-color-primary-500)] !px-[length:var(--ads-size-s)] !py-[length:var(--ads-size-quark)] !text-base text-white active:opacity-90"
        onClick={handleContinue}
      >
        Continue
      </MobileButton>
    </div>
  );
}
