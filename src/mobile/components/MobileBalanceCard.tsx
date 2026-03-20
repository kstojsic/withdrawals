import { useState, type ReactNode } from 'react';
import type { Account } from '../../types';
import { formatCurrency, FX_RATE, FX_BUFFER } from '../../data/accounts';

interface MobileBalanceCardProps {
  account: Account;
  /** Slim single-row style for wizard amount step */
  variant?: 'default' | 'compact';
}

export default function MobileBalanceCard({ account, variant = 'default' }: MobileBalanceCardProps) {
  const [combined, setCombined] = useState(false);
  const isMargin = account.type === 'MARGIN';
  const cadBalance = account.balance.cad;
  const usdBalance = account.balance.usd;

  const combinedCad = cadBalance + usdBalance * FX_RATE * (1 - FX_BUFFER);
  const combinedUsd = cadBalance / FX_RATE * (1 - FX_BUFFER) + usdBalance;

  const displayCad = combined ? combinedCad : cadBalance;
  const displayUsd = combined ? combinedUsd : usdBalance;

  const cadLabel = combined ? 'Combined CAD' : 'CAD';
  const usdLabel = combined ? 'Combined USD' : 'USD';

  if (variant === 'compact') {
    return (
      <div className="border border-qt-border rounded-lg overflow-hidden bg-white">
        <div className="flex items-center justify-between gap-2 px-2 py-1 bg-qt-bg-3 border-b border-qt-border">
          <span className="text-[10px] font-semibold uppercase tracking-wide text-qt-secondary">Balances</span>
          <button
            type="button"
            onClick={() => setCombined((v) => !v)}
            className="flex items-center gap-1.5 min-h-8 shrink-0 cursor-pointer active:opacity-80"
            aria-pressed={combined}
            aria-label={combined ? 'Show separate currency amounts' : 'Show combined converted amounts'}
          >
            <span
              className={`relative inline-flex h-4 w-7 items-center rounded-full transition-colors ${combined ? 'bg-qt-green' : 'bg-qt-border'}`}
            >
              <span
                className={`inline-block size-3 rounded-full bg-white shadow transition-transform ${combined ? 'translate-x-[14px]' : 'translate-x-[3px]'}`}
              />
            </span>
            <span className="text-[10px] font-semibold text-qt-green-dark">{combined ? 'Combined' : 'Separate'}</span>
          </button>
        </div>
        <div className="grid grid-cols-2 divide-x divide-qt-border">
          <div className="py-1 px-1.5 text-center min-w-0">
            <p className="text-[9px] font-bold uppercase text-qt-secondary truncate">{cadLabel}</p>
            <p className="text-xs font-semibold text-qt-primary tabular-nums leading-tight">{formatCurrency(displayCad, 'CAD')}</p>
          </div>
          <div className="py-1 px-1.5 text-center min-w-0">
            <p className="text-[9px] font-bold uppercase text-qt-secondary truncate">{usdLabel}</p>
            <p className="text-xs font-semibold text-qt-primary tabular-nums leading-tight">{formatCurrency(displayUsd, 'USD')}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="border-2 border-qt-border rounded-xl overflow-hidden shadow-sm">
        <div className="flex items-center justify-between px-4 py-3 bg-qt-bg-3 border-b border-qt-border">
          <p className="font-semibold text-sm text-qt-primary">Available to Withdraw</p>
          <button
            onClick={() => setCombined((c) => !c)}
            className="flex items-center gap-2 min-h-[44px] min-w-[44px] items-center justify-center text-xs font-semibold text-qt-green-dark active:opacity-80 cursor-pointer"
          >
            <span className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${combined ? 'bg-qt-green' : 'bg-qt-border'}`}>
              <span className={`inline-block size-4 rounded-full bg-white transition-transform ${combined ? 'translate-x-[22px]' : 'translate-x-[4px]'}`} />
            </span>
            {combined ? 'Combined' : 'Separate'}
          </button>
        </div>

        {isMargin ? (
          <div className="grid grid-cols-2 divide-x divide-qt-border">
            <div className="p-4 text-center">
              <p className="text-xs font-bold tracking-wider uppercase text-qt-secondary mb-1">{cadLabel}</p>
              <p className="text-lg font-semibold text-qt-primary">{formatCurrency(displayCad, 'CAD')}</p>
            </div>
            <div className="p-4 text-center">
              <p className="text-xs font-bold tracking-wider uppercase text-qt-secondary mb-1">{usdLabel}</p>
              <p className="text-lg font-semibold text-qt-primary">{formatCurrency(displayUsd, 'USD')}</p>
            </div>
          </div>
        ) : (
          <div>
            <div className="grid grid-cols-3 px-4 py-2 bg-qt-bg-2 border-b border-qt-border">
              <p className="text-xs font-bold tracking-wider uppercase text-qt-secondary">&nbsp;</p>
              <p className="text-xs font-bold tracking-wider uppercase text-qt-secondary text-center">{cadLabel}</p>
              <p className="text-xs font-bold tracking-wider uppercase text-qt-secondary text-center">{usdLabel}</p>
            </div>
            <MobileMarginRow
              label="Available to withdraw"
              cad={displayCad}
              usd={displayUsd}
              bold
              combined={combined}
            />
            <div className="border-t border-qt-border">
              <MobileMarginRow
                label="Unavailable funds"
                cad={combined ? 150 + 50 * FX_RATE * (1 - FX_BUFFER) : 150}
                usd={combined ? 150 / FX_RATE * (1 - FX_BUFFER) + 50 : 50}
                combined={combined}
              />
            </div>
          </div>
        )}
      </div>
      {!isMargin && (
        <p className="text-xs text-qt-secondary mt-2 leading-relaxed">
          You can only withdraw fully settled funds. Any funds from recent trades will be available for withdrawal upon settlement (typically 1 business day).
        </p>
      )}
    </div>
  );
}

function MobileMarginRow({
  label,
  cad,
  usd,
  bold,
  combined,
}: {
  label: ReactNode;
  cad: number;
  usd: number;
  bold?: boolean;
  combined: boolean;
}) {
  return (
    <div className="grid grid-cols-3 px-4 py-3 items-center">
      <p className={`text-sm ${bold ? 'font-semibold text-qt-primary' : 'text-qt-secondary'}`}>{label}</p>
      <p className={`text-sm text-center ${bold ? 'font-semibold text-qt-primary' : 'text-qt-primary'}`}>
        {formatCurrency(cad, 'CAD')}
      </p>
      <p className={`text-sm text-center ${bold ? 'font-semibold text-qt-primary' : 'text-qt-primary'}`}>
        {formatCurrency(usd, 'USD')}
      </p>
    </div>
  );
}
