import type { Account } from '../../types';
import {
  accountListSubtitle,
  accountPrimaryTitle,
  formatAvailableToWithdrawLine,
} from '../lib/accountListDisplay';

interface MobileAccountSelectionListProps {
  accounts: Account[];
  value: string | null;
  onSelect: (account: Account) => void;
}

/**
 * Full-width selectable account cards (radio + type/number + subtitle + available to withdraw).
 * Matches mobile PAD / funding account-picker pattern (ADS field + card styling).
 */
export default function MobileAccountSelectionList({
  accounts,
  value,
  onSelect,
}: MobileAccountSelectionListProps) {
  return (
    <div className="flex w-full max-w-[357px] flex-col gap-3" role="radiogroup" aria-label="Accounts">
      {accounts.map((a) => {
        const selected = value === a.id;
        return (
          <label
            key={a.id}
            className={`flex cursor-pointer items-start gap-3 rounded-[length:var(--ads-border-radius-m)] border border-solid bg-[var(--ads-color-elevation-overlay)] p-4 shadow-[0_2px_8px_rgba(38,45,51,0.06)] transition-colors ${
              selected
                ? 'border-qt-green bg-qt-green-bg/25'
                : 'border-[var(--ads-color-secondary-400)] active:bg-qt-bg-3'
            }`}
          >
            <input
              type="radio"
              name="mobile-account-pick"
              value={a.id}
              checked={selected}
              onChange={() => onSelect(a)}
              className="mt-0.5 size-5 shrink-0 cursor-pointer accent-qt-green"
            />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold leading-snug text-[var(--ads-color-body-contrast-100)]">
                {accountPrimaryTitle(a)}
              </p>
              <p className="mt-0.5 text-xs font-normal leading-snug text-figma-neutral-200">
                {accountListSubtitle(a)}
              </p>
              <p className="mt-1 text-sm font-normal leading-snug text-[var(--ads-color-body-contrast-100)]">
                {formatAvailableToWithdrawLine(a)}
              </p>
            </div>
          </label>
        );
      })}
    </div>
  );
}
