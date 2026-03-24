import { useEffect, useMemo, type Dispatch, type SetStateAction } from 'react';
import type { LinkedBank, WithdrawalMethod } from '../types';
import type { InternationalWireData } from '../types';
import {
  getWithdrawalMethodDisableFlags,
  type WithdrawalMethodDisableFlags,
} from '../data/accounts';

/**
 * Derives per-method disabled flags from the selected linked bank and keeps `method` / intl wire
 * currency aligned when the bank changes (US+USD → international wire only; CA → not intl).
 */
export function useLinkedBankWithdrawalRules<M extends WithdrawalMethod | null>(
  allBanks: LinkedBank[],
  selectedBankId: string | null,
  setMethod: Dispatch<SetStateAction<M>>,
  setIntlWire: Dispatch<SetStateAction<InternationalWireData>>,
): { bank: LinkedBank | undefined; methodDisabled: WithdrawalMethodDisableFlags } {
  const bank = useMemo(
    () => allBanks.find((b) => b.id === selectedBankId),
    [allBanks, selectedBankId],
  );

  const methodDisabled = useMemo(
    () => getWithdrawalMethodDisableFlags(bank ?? null),
    [bank?.id, bank?.institutionCountry, bank?.depositCurrency],
  );

  useEffect(() => {
    const f = getWithdrawalMethodDisableFlags(bank ?? null);
    setMethod((m) => {
      if (f.eft && f.wire) return 'international_wire' as M;
      if (f.international_wire && m === 'international_wire') return 'eft' as M;
      return m;
    });
    if (f.eft && f.wire && bank) {
      const dep = bank.depositCurrency ?? 'CAD';
      setIntlWire((d) => ({
        ...d,
        currency: dep === 'USD' ? 'USD' : d.currency,
      }));
    }
  }, [bank?.id, bank?.institutionCountry, bank?.depositCurrency, setMethod, setIntlWire]);

  return { bank, methodDisabled };
}
