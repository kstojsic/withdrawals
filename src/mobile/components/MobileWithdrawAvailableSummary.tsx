import { useId, useState } from 'react';
import { formatCurrency } from '../../data/accounts';

const WHY_UNAVAILABLE_COPY =
  'Funds may be unavailable due to unsettled trades, open orders, or pending deposits. These will be released once settled — typically within 1 business day.';

export interface MobileWithdrawAvailableSummaryProps {
  primaryCurrency: string;
  availableBalance: number;
  unavailableBalance: number;
  secondaryCurrency?: string;
  secondaryBalance?: number;
  maxFromSecondaryInPrimary?: number;
  combinedMaxInPrimary?: number;
}

/** e.g. `USD $12,840.25` / `CAD $62,300.33` */
function formatWithCurrencyCode(currency: 'CAD' | 'USD', amount: number): string {
  const formatted = amount.toLocaleString('en-CA', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${currency} $${formatted}`;
}

/** Balance card + optional conversion lines — same visuals as the TFSA withdrawal amount step. */
export default function MobileWithdrawAvailableSummary({
  primaryCurrency,
  availableBalance,
  unavailableBalance,
  secondaryCurrency,
  secondaryBalance,
  maxFromSecondaryInPrimary,
  combinedMaxInPrimary,
}: MobileWithdrawAvailableSummaryProps) {
  const [whyOpen, setWhyOpen] = useState(false);
  const whyRegionId = useId();

  const primary = primaryCurrency.toUpperCase();
  const primaryCode = primary as 'CAD' | 'USD';
  const secondaryCode = (secondaryCurrency?.toUpperCase() ?? 'USD') as 'CAD' | 'USD';

  const hasConversionLine =
    secondaryCurrency != null &&
    secondaryBalance != null &&
    maxFromSecondaryInPrimary != null &&
    combinedMaxInPrimary != null &&
    secondaryBalance > 0;

  const secondaryAmountPlain = secondaryBalance?.toLocaleString('en-CA', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return (
    <div className="flex w-full max-w-[357px] flex-col gap-4">
      <div>
        <div className="overflow-hidden rounded-2xl border border-solid border-[var(--ads-color-secondary-400)] bg-[var(--ads-color-elevation-overlay)] px-4 py-4">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-medium text-qt-secondary">Available in {primary}</p>
            <p className="text-right text-[22px] font-bold leading-tight tracking-tight text-qt-primary tabular-nums">
              {formatCurrency(availableBalance, primaryCode)}
            </p>
          </div>
          <div className="my-3 h-px w-full bg-figma-neutral-100" aria-hidden />
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

      {hasConversionLine && (
        <div className="text-[11px] leading-relaxed text-qt-secondary">
          <p className="tabular-nums text-qt-primary">
            You also hold ${secondaryAmountPlain} {secondaryCode}
          </p>
          <p className="mt-2 text-sm font-bold tabular-nums text-qt-primary">
            Total available to withdraw: {formatWithCurrencyCode(primaryCode, combinedMaxInPrimary!)}
          </p>
        </div>
      )}
    </div>
  );
}
