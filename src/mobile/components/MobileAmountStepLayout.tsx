import type { ReactNode } from 'react';
import type { Account } from '../../types';
import MobileBalanceCard from './MobileBalanceCard';

/** Fits on one phone screen: input + compact balance, no forced min-heights. */
export default function MobileAmountStepLayout({
  account,
  children,
  footerNote,
}: {
  account: Account | null;
  children: ReactNode;
  footerNote?: ReactNode;
}) {
  return (
    <div className="flex flex-1 min-h-0 flex-col gap-2 overflow-hidden">
      {footerNote}
      <div className="flex flex-1 min-h-0 flex-col justify-center gap-1 py-0.5 overflow-hidden">{children}</div>
      <div className="shrink-0 pt-2 border-t border-[#E5E7EB]">
        <p className="text-[10px] font-semibold text-[#78899F] uppercase tracking-wide mb-1">Available to withdraw</p>
        {account ? <MobileBalanceCard account={account} variant="compact" /> : null}
      </div>
    </div>
  );
}
