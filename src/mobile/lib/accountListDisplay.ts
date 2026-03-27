import type { Account } from '../../types';
import {
  balanceToDisplayAmount,
  formatCurrency,
  getWithdrawalAmountStepData,
} from '../../data/accounts';

/** Second line under account title (Questrade-style). */
export function accountListSubtitle(account: Account): string {
  if (account.type === 'RESP') return 'Family RESP';
  return 'Self-directed Individual';
}

/** Buying power in CAD for list display (margin uses margin buying power; others use combined available in CAD). */
export function accountBuyingPowerCad(account: Account): number {
  if (account.type === 'MARGIN' && account.marginBreakdown) {
    const bp = account.marginBreakdown.buyingPower;
    return balanceToDisplayAmount(bp.cad, bp.usd, 'CAD');
  }
  return getWithdrawalAmountStepData(account, 'CAD').combinedMaxInPrimary;
}

/** Bold first line: e.g. `TFSA – 53154245` (matches mobile account-picker spec). */
export function accountPrimaryTitle(account: Account): string {
  return `${account.type} – ${account.accountNumber}`;
}

export function formatAvailableToWithdrawLine(account: Account): string {
  return `Available to withdraw: ${formatCurrency(accountBuyingPowerCad(account), 'CAD')}`;
}
