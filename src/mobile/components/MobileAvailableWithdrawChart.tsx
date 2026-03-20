import type { Account, Currency } from '../../types';
import { formatCurrency, balanceToDisplayAmount, settledBalances } from '../../data/accounts';
import MobileInfoTooltip from './MobileInfoTooltip';

const UNAVAILABLE_TOOLTIP =
  'Funds from recent trades may still be settling. They become available for withdrawal after settlement (typically 1 business day).';

export default function MobileAvailableWithdrawChart({
  account,
  displayCurrency,
}: {
  account: Account;
  displayCurrency: Currency;
}) {
  const { cad: cadAvail, usd: usdAvail } = settledBalances(account);
  const available = balanceToDisplayAmount(cadAvail, usdAvail, displayCurrency);

  const unavailCad = 150;
  const unavailUsd = 50;
  const unavailable = balanceToDisplayAmount(unavailCad, unavailUsd, displayCurrency);

  const total = Math.max(available + unavailable, 0.01);
  const availPct = (available / total) * 100;
  const unavailPct = (unavailable / total) * 100;

  return (
    <div className="rounded-xl border border-qt-border bg-white p-3 shadow-sm">
      <p className="text-center text-[11px] font-semibold uppercase tracking-wide text-qt-secondary">
        Available to withdraw
      </p>

      <div className="mt-3 h-4 w-full overflow-hidden rounded-full bg-qt-bg-3">
        <div className="flex h-full w-full">
          <div
            className="h-full bg-qt-green transition-all"
            style={{ width: `${availPct}%` }}
            title="Available"
          />
          <div
            className="h-full bg-qt-border"
            style={{ width: `${unavailPct}%` }}
            title="Unavailable"
          />
        </div>
      </div>

      <div className="mt-3 space-y-2">
        <div className="flex items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="size-2 shrink-0 rounded-full bg-qt-green" aria-hidden />
            <span className="font-medium text-qt-primary">Available</span>
          </div>
          <span className="shrink-0 font-semibold tabular-nums text-qt-primary">
            {formatCurrency(available, displayCurrency)}
          </span>
        </div>
        <div className="flex items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-1 min-w-0">
            <span className="size-2 shrink-0 rounded-full bg-qt-border" aria-hidden />
            <span className="font-medium text-qt-secondary">Unavailable funds</span>
            <MobileInfoTooltip content={UNAVAILABLE_TOOLTIP} />
          </div>
          <span className="shrink-0 font-semibold tabular-nums text-qt-secondary">
            {formatCurrency(unavailable, displayCurrency)}
          </span>
        </div>
      </div>
    </div>
  );
}
