import { useState, type ReactNode } from 'react';
import type { Account } from '../types';
import { formatCurrency, FX_RATE } from '../data/accounts';
import Tooltip from './Tooltip';

interface BalanceCardProps {
  account: Account;
}

export default function BalanceCard({ account }: BalanceCardProps) {
  const [combined, setCombined] = useState(false);
  const isMargin = account.type === 'MARGIN' && account.marginBreakdown;

  const cadBalance = account.balance.cad;
  const usdBalance = account.balance.usd;

  const combinedCad = cadBalance + usdBalance * FX_RATE;
  const combinedUsd = cadBalance / FX_RATE + usdBalance;

  const displayCad = combined ? combinedCad : cadBalance;
  const displayUsd = combined ? combinedUsd : usdBalance;

  const cadLabel = combined ? 'Combined CAD' : 'CAD';
  const usdLabel = combined ? 'Combined USD' : 'USD';

  return (
    <div className="border border-qt-border rounded-lg overflow-hidden shadow-sm">
      <div className="flex items-center justify-between px-5 py-3 bg-qt-bg-3 border-b border-qt-border">
        <p className="font-semibold text-sm text-qt-primary">Account Balance</p>
        <button
          onClick={() => setCombined((c) => !c)}
          className="flex items-center gap-2 text-xs font-semibold text-qt-green-dark hover:underline cursor-pointer"
        >
          <span className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${combined ? 'bg-qt-green' : 'bg-qt-border'}`}>
            <span className={`inline-block size-3.5 rounded-full bg-white transition-transform ${combined ? 'translate-x-[18px]' : 'translate-x-[3px]'}`} />
          </span>
          {combined ? 'Combined' : 'Separate'}
        </button>
      </div>

      {!isMargin ? (
        <div className="grid grid-cols-2 divide-x divide-qt-border">
          <div className="p-5 text-center">
            <p className="text-xs font-bold tracking-wider uppercase text-qt-secondary mb-1">{cadLabel}</p>
            <p className="text-xl font-semibold text-qt-primary">{formatCurrency(displayCad, 'CAD')}</p>
          </div>
          <div className="p-5 text-center">
            <p className="text-xs font-bold tracking-wider uppercase text-qt-secondary mb-1">{usdLabel}</p>
            <p className="text-xl font-semibold text-qt-primary">{formatCurrency(displayUsd, 'USD')}</p>
          </div>
        </div>
      ) : (
        <div>
          <div className="grid grid-cols-3 px-5 py-2 bg-qt-bg-2 border-b border-qt-border">
            <p className="text-xs font-bold tracking-wider uppercase text-qt-secondary">&nbsp;</p>
            <p className="text-xs font-bold tracking-wider uppercase text-qt-secondary text-center">{cadLabel}</p>
            <p className="text-xs font-bold tracking-wider uppercase text-qt-secondary text-center">{usdLabel}</p>
          </div>
          <MarginRow
            label="Total available to withdraw"
            cad={displayCad}
            usd={displayUsd}
            bold
            combined={combined}
          />
          <div className="border-t border-qt-border">
            <MarginRow
              label="Settled Cash"
              cad={combined ? account.marginBreakdown!.settledCash.cad + account.marginBreakdown!.settledCash.usd * FX_RATE : account.marginBreakdown!.settledCash.cad}
              usd={combined ? account.marginBreakdown!.settledCash.cad / FX_RATE + account.marginBreakdown!.settledCash.usd : account.marginBreakdown!.settledCash.usd}
              combined={combined}
            />
          </div>
          <div className="border-t border-qt-border">
            <MarginRow
              label={
                <span className="inline-flex items-center gap-1.5">
                  Buying Power
                  <Tooltip content="If you withdraw from your Buying Power, you will be charged interest" />
                </span>
              }
              cad={combined ? account.marginBreakdown!.buyingPower.cad + account.marginBreakdown!.buyingPower.usd * FX_RATE : account.marginBreakdown!.buyingPower.cad}
              usd={combined ? account.marginBreakdown!.buyingPower.cad / FX_RATE + account.marginBreakdown!.buyingPower.usd : account.marginBreakdown!.buyingPower.usd}
              combined={combined}
            />
          </div>
        </div>
      )}
    </div>
  );
}

function MarginRow({
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
    <div className="grid grid-cols-3 px-5 py-3 items-center">
      <p className={`text-sm ${bold ? 'font-semibold text-qt-primary' : 'text-qt-secondary pl-4'}`}>{label}</p>
      <p className={`text-sm text-center ${bold ? 'font-semibold text-qt-primary' : 'text-qt-primary'}`}>
        {formatCurrency(cad, combined ? 'CAD' : 'CAD')}
      </p>
      <p className={`text-sm text-center ${bold ? 'font-semibold text-qt-primary' : 'text-qt-primary'}`}>
        {formatCurrency(usd, combined ? 'USD' : 'USD')}
      </p>
    </div>
  );
}
