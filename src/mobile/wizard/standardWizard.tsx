import type { ReactNode } from 'react';
import type { Account, Currency, WithdrawalMethod, LinkedBank, InternationalWireData } from '../../types';
import type { MobileWizardStepDef } from './types';
import MobileAccountDropdown from '../components/MobileAccountDropdown';
import MobileCurrencySelector from '../components/MobileCurrencySelector';
import MobileCurrencyInput from '../components/MobileCurrencyInput';
import MobileMethodSelector from '../components/MobileMethodSelector';
import MobileBankSelector from '../components/MobileBankSelector';
import MobileInternationalWireForm from '../components/MobileInternationalWireForm';
import MobileESignature from '../components/MobileESignature';
import MobileAmountStepLayout from '../components/MobileAmountStepLayout';
import { formatCurrency } from '../../data/accounts';

export interface StandardWizardCtx {
  accountOptions: Account[];
  account: Account | null;
  onAccountChange: (a: Account) => void;
  currency: Currency | null;
  setCurrency: (c: Currency) => void;
  combinedCad: number;
  combinedUsd: number;
  amount: string;
  setAmount: (v: string) => void;
  parsedAmount: number;
  exceedsAvailable: boolean;
  triggersConversion: boolean;
  maxAmount: number;
  method: WithdrawalMethod | null;
  setMethod: (m: WithdrawalMethod | null) => void;
  selectedBank: string | null;
  setSelectedBank: (id: string | null) => void;
  allBanks: LinkedBank[];
  setAllBanks: (b: LinkedBank[]) => void;
  /** Show CAD/USD picker when no bank or customer linked a new account from modal */
  showWithdrawalCurrency: boolean;
  onDepositBankSelectionKind: (kind: 'existing' | 'newly_linked') => void;
  intlWire: InternationalWireData;
  setIntlWire: (d: InternationalWireData) => void;
  signed: boolean;
  setSigned: (v: boolean) => void;
  fee: number;
  netAmount: number;
  canContinue: boolean;
  renderReviewSummary: () => ReactNode;
}

export function buildStandardWizardSteps(): MobileWizardStepDef<StandardWizardCtx>[] {
  return [
    {
      id: 'account',
      visible: () => true,
      canProceed: (c) => !!c.account && !!c.currency,
      nextLabel: 'Continue',
      render: (c) => (
        <div className="flex flex-1 flex-col min-h-0 gap-1.5 justify-start">
          <p className="text-[11px] font-medium text-[#333333] leading-tight">Withdraw funds</p>
          <MobileAccountDropdown
            accounts={c.accountOptions}
            value={c.account?.id ?? null}
            onChange={c.onAccountChange}
          />
          {c.account && (
            <div className="flex flex-col gap-0.5">
              <p className="text-[9px] text-[#78899F] leading-tight">
                EFT / Canadian wire: pick deposit bank. International wire later.
              </p>
              <MobileBankSelector
                value={c.selectedBank}
                onChange={c.setSelectedBank}
                allBanks={c.allBanks}
                onBanksChange={c.setAllBanks}
                onSelectionKind={c.onDepositBankSelectionKind}
              />
            </div>
          )}
          {c.account && c.showWithdrawalCurrency && (
            <MobileCurrencySelector
              value={c.currency}
              onChange={(cur) => {
                c.setCurrency(cur);
                c.setAmount('');
              }}
              cadAmount={c.combinedCad}
              usdAmount={c.combinedUsd}
              compact
            />
          )}
        </div>
      ),
    },
    {
      id: 'amount',
      visible: (c) => !!c.currency,
      canProceed: (c) => c.parsedAmount > 0 && !c.exceedsAvailable,
      nextLabel: 'Continue',
      render: (c) => (
        <MobileAmountStepLayout
          account={c.account}
          footerNote={
            c.triggersConversion ? (
              <div className="rounded-lg border border-amber-300 bg-amber-50 px-2 py-1.5 mb-1 shrink-0">
                <p className="text-[11px] leading-snug text-amber-800">
                  Exceeds {c.currency} cash — conversion will apply.
                </p>
              </div>
            ) : undefined
          }
        >
          <MobileCurrencyInput
            variant="hero"
            label="Withdrawal amount"
            value={c.amount}
            onChange={c.setAmount}
            error={
              c.exceedsAvailable
                ? `Amount exceeds available balance of ${formatCurrency(c.maxAmount, c.currency!)}`
                : undefined
            }
          />
        </MobileAmountStepLayout>
      ),
    },
    {
      id: 'method',
      visible: (c) => c.parsedAmount > 0 && !c.exceedsAvailable,
      canProceed: (c) => !!c.method,
      nextLabel: 'Continue',
      render: (c) => (
        <MobileMethodSelector
          value={c.method}
          onChange={(m) => {
            c.setMethod(m);
            c.setSelectedBank(null);
            c.setSigned(false);
          }}
          currency={c.currency}
        />
      ),
    },
    {
      id: 'destination',
      visible: (c) =>
        !!c.method &&
        c.parsedAmount > 0 &&
        !c.exceedsAvailable &&
        (c.method === 'international_wire' || !c.selectedBank),
      canProceed: (c) =>
        c.method === 'international_wire'
          ? !!(c.intlWire.bankName && c.intlWire.swiftCode && c.signed)
          : !!c.selectedBank,
      nextLabel: 'Continue',
      render: (c) => (
        <div className="flex flex-1 flex-col min-h-0 gap-2">
          {c.method === 'international_wire' ? (
            <>
              <MobileInternationalWireForm
                currency={c.currency || 'CAD'}
                amount={c.amount}
                data={c.intlWire}
                onChange={c.setIntlWire}
              />
              <MobileESignature onSign={() => c.setSigned(true)} signed={c.signed} />
            </>
          ) : (
            <MobileBankSelector
              value={c.selectedBank}
              onChange={c.setSelectedBank}
              allBanks={c.allBanks}
              onBanksChange={c.setAllBanks}
            />
          )}
        </div>
      ),
    },
    {
      id: 'review',
      visible: (c) => c.canContinue,
      canProceed: () => true,
      nextLabel: 'Submit withdrawal',
      render: (c) => (
        <div className="flex flex-1 flex-col min-h-0 gap-2">
          <h2 className="font-semibold text-base text-[#333333] shrink-0">Review & confirm</h2>
          <div className="bg-white border border-[#E5E7EB] rounded-lg divide-y divide-[#E5E7EB] min-h-0 overflow-y-auto">{c.renderReviewSummary()}</div>
          {((c.currency === 'CAD' && c.parsedAmount > 50000) || (c.currency === 'USD' && c.parsedAmount > 25000)) && (
            <div className="px-2 py-1.5 bg-amber-50 border border-amber-200 rounded-lg shrink-0">
              <p className="text-[11px] leading-snug text-amber-800">
                Over $50k CAD / $25k USD — split into multiple withdrawals.
              </p>
            </div>
          )}
        </div>
      ),
    },
  ];
}
