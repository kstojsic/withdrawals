import { useId, useState } from 'react';
import { formatCurrency } from '../../data/accounts';
import MobileInfoTooltip from './MobileInfoTooltip';

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

/** e.g. `CAD $12,652.90` for hero total */
function formatWithCurrencyCode(currency: 'CAD' | 'USD', amount: number): string {
  const formatted = amount.toLocaleString('en-CA', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${currency} $${formatted}`;
}

function combinedAvailableTooltip(primary: string, secondary: string): string {
  return `This combines your ${primary} balance and your ${secondary} balance converted at today's rate. A small buffer is applied to protect against rate movements between now and when your request is processed.`;
}

/** Balance card: total hero, optional CAD | USD columns, unavailable + Why? */
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
  const secondary = secondaryCurrency?.toUpperCase() ?? 'USD';

  const hasConversionLine =
    secondaryCurrency != null &&
    secondaryBalance != null &&
    maxFromSecondaryInPrimary != null &&
    combinedMaxInPrimary != null &&
    secondaryBalance > 0;

  const totalInPrimary = combinedMaxInPrimary ?? availableBalance;

  return (
    <div className="flex w-full max-w-[357px] flex-col gap-4">
      <div>
        <div className="rounded-2xl border border-solid border-[var(--ads-color-secondary-400)] bg-[var(--ads-color-elevation-overlay)] px-4 py-4">
          {/* Hero: total available */}
          <div>
            <p className="text-sm font-medium text-qt-secondary">Combined available to withdraw</p>
            <div className="mt-1 flex items-center gap-2">
              <p className="min-w-0 flex-1 text-[26px] font-bold leading-tight tracking-tight text-qt-primary tabular-nums">
                {formatWithCurrencyCode(primaryCode, totalInPrimary)}
              </p>
              {hasConversionLine && (
                <span className="shrink-0">
                  <MobileInfoTooltip
                    content={combinedAvailableTooltip(primary, secondary)}
                    placement="bottom"
                    horizontalAlign="viewport"
                  />
                </span>
              )}
            </div>
          </div>

          <div className="my-3 h-px w-full bg-figma-neutral-100" aria-hidden />

          {/* Two-column breakdown when both currencies have a balance */}
          {hasConversionLine && (
            <>
              <div className="grid grid-cols-2 gap-0">
                <div className="min-w-0 border-r border-figma-neutral-100 pr-3">
                  <p className="text-[11px] font-medium text-qt-secondary">{primary} balance</p>
                  <p className="mt-0.5 text-base font-bold tabular-nums text-qt-primary">
                    {formatCurrency(availableBalance, primaryCode)}
                  </p>
                </div>
                <div className="min-w-0 pl-3">
                  <p className="text-[11px] font-medium leading-snug text-qt-secondary">{secondary} balance</p>
                  <p className="mt-0.5 text-base font-bold tabular-nums text-qt-primary">
                    {formatCurrency(secondaryBalance!, secondaryCode)}
                  </p>
                </div>
              </div>
              <div className="my-3 h-px w-full bg-figma-neutral-100" aria-hidden />
            </>
          )}

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
    </div>
  );
}
