import type { ReactNode } from 'react';
import type { Account, Currency, WithdrawalMethod, LinkedBank, InternationalWireData, RRSPWithdrawalType } from '../../types';
import type { MobileWizardStepDef } from './types';
import MobileAccountDropdown from '../components/MobileAccountDropdown';
import MobileCurrencySelector from '../components/MobileCurrencySelector';
import MobileCurrencyInput from '../components/MobileCurrencyInput';
import MobileMethodSelector from '../components/MobileMethodSelector';
import MobileBankSelector from '../components/MobileBankSelector';
import MobileInternationalWireForm from '../components/MobileInternationalWireForm';
import MobileESignature from '../components/MobileESignature';
import MobileWithdrawalTypeDropdown from '../components/MobileWithdrawalTypeDropdown';
import MobileAmountStepLayout from '../components/MobileAmountStepLayout';
import MobileInfoBox from '../components/MobileInfoBox';
import MobileButton from '../components/MobileButton';
import RRSPCalculator from '../../components/RRSPCalculator';
import HBPEligibility from '../../components/HBPEligibility';
import LLPEligibility from '../../components/LLPEligibility';
import AddressInput from '../../components/AddressInput';
import { formatCurrency } from '../../data/accounts';

const rrspOptions: { value: RRSPWithdrawalType; label: string; badge?: string }[] = [
  { value: 'deregistration', label: 'Deregistration (Retirement or Another Reason)', badge: 'Taxable' },
  { value: 'hbp', label: "Home Buyer's Plan" },
  { value: 'llp', label: 'Lifelong Learning Plan' },
  { value: 'overcontribution', label: 'Overcontribution' },
];

export interface RrspWizardCtx {
  accountOptions: Account[];
  account: Account | null;
  onAccountChange: (a: Account) => void;
  onNavigateHome: () => void;
  resetForm: () => void;

  rrspType: RRSPWithdrawalType | '';
  setRrspType: (t: RRSPWithdrawalType) => void;

  isDeregistration: boolean;
  isHBP: boolean;
  isLLP: boolean;
  isOvercontribution: boolean;

  combinedCad: number;
  combinedUsd: number;
  maxAmount: number;
  currency: Currency | null;
  setCurrency: (c: Currency) => void;
  amount: string;
  setAmount: (v: string) => void;
  grossAmount: number;
  setGrossAmount: (n: number) => void;
  parsedAmount: number;
  exceedsAvailable: boolean;
  triggersConversion: boolean;

  hbpMax: number;
  llpYearlyMax: number;
  llpLifetimeMax: number;

  method: WithdrawalMethod | null;
  setMethod: (m: WithdrawalMethod | null) => void;
  selectedBank: string | null;
  setSelectedBank: (id: string | null) => void;
  allBanks: LinkedBank[];
  setAllBanks: (b: LinkedBank[]) => void;
  showWithdrawalCurrency: boolean;
  onDepositBankSelectionKind: (kind: 'existing' | 'newly_linked') => void;
  intlWire: InternationalWireData;
  setIntlWire: (d: InternationalWireData) => void;
  signed: boolean;
  setSigned: (v: boolean) => void;

  bankReady: boolean;
  hbpEligible: boolean | null;
  setHbpEligible: (v: boolean | null) => void;
  address: { street: string; city: string; province: string; postalCode: string };
  setAddress: (a: { street: string; city: string; province: string; postalCode: string }) => void;
  llpEligible: boolean;
  setLlpEligible: (v: boolean) => void;
  llpData: Record<string, unknown>;
  setLlpData: (d: Record<string, unknown>) => void;
  confirmChecked: boolean;
  setConfirmChecked: (v: boolean) => void;

  fee: number;
  withholdingTax: number;
  net: number;
  canContinueDeregistration: boolean;
  canContinueHBP: boolean;
  canContinueLLP: boolean;
  renderReviewSummary: () => ReactNode;
}

/**
 * RRSP: one display slot for ovp OR dereg OR HBP OR LLP amount (config indices 1–4 after merged account step).
 */
export function getRrspWizardShellProgress(
  steps: { id: string }[],
  currentId: string,
): { stepIndex: number; totalSteps: number } {
  const n = steps.length;
  const totalSteps = Math.max(1, n - 3);
  const idx = steps.findIndex((s) => s.id === currentId);
  if (idx < 0) return { stepIndex: 0, totalSteps };
  if (idx === 0) return { stepIndex: 0, totalSteps };
  if (idx <= 4) return { stepIndex: 1, totalSteps };
  return { stepIndex: idx - 3, totalSteps };
}

export function buildRrspWizardSteps(): MobileWizardStepDef<RrspWizardCtx>[] {
  return [
    {
      id: 'account',
      visible: () => true,
      canProceed: (c) => !!c.account && !!c.rrspType && !!c.currency,
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
                c.setGrossAmount(0);
                c.setAmount('');
              }}
              cadAmount={c.combinedCad}
              usdAmount={c.combinedUsd}
              compact
            />
          )}
          {c.account && (
            <MobileWithdrawalTypeDropdown<RRSPWithdrawalType>
              options={rrspOptions}
              value={c.rrspType}
              onChange={(v) => {
                const cur = c.currency;
                c.resetForm();
                c.setRrspType(v);
                if (cur) c.setCurrency(cur);
              }}
            />
          )}
        </div>
      ),
    },
    {
      id: 'ovp-instructions',
      visible: (c) => c.isOvercontribution && !!c.currency,
      canProceed: () => false,
      hideFooter: true,
      render: (c) => (
        <div className="flex flex-col gap-3">
          <MobileInfoBox>
            <div className="flex flex-col gap-2">
              <p className="font-semibold text-xs">RRSP overcontributions</p>
              <p className="text-[11px] leading-snug">
                To remove excess contributions, complete the CRA&apos;s <strong>T3012A</strong> form, get CRA approval, then mail the approved form to Questrade.
              </p>
              <a
                href="https://www.canada.ca/en/revenue-agency/services/forms-publications/forms/t3012a.html"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] font-semibold text-qt-green-dark"
              >
                Download T3012A →
              </a>
            </div>
          </MobileInfoBox>
          <MobileButton variant="secondary" onClick={() => c.onNavigateHome()}>
            Return to accounts
          </MobileButton>
        </div>
      ),
    },
    {
      id: 'amount-dereg',
      visible: (c) => c.isDeregistration && !!c.currency,
      canProceed: (c) => c.grossAmount > 0 && !c.exceedsAvailable,
      nextLabel: 'Continue',
      render: (c) => (
        <MobileAmountStepLayout account={c.account}>
          <div className="flex flex-col gap-1 w-full min-h-0">
            <RRSPCalculator
              compact
              currency={c.currency || 'CAD'}
              onAmountChange={(g) => {
                c.setGrossAmount(g);
                c.setAmount(g > 0 ? g.toFixed(2) : '');
              }}
            />
            {c.grossAmount > 0 && (
              <div className="bg-qt-bg-3 rounded-lg p-2 shrink-0">
                <p className="text-[10px] text-qt-secondary mb-0.5">Withdrawal amount</p>
                <p className="text-sm font-semibold text-qt-primary">{formatCurrency(c.grossAmount, c.currency || 'CAD')}</p>
                {c.exceedsAvailable && (
                  <p className="text-xs font-semibold text-qt-red mt-1">
                    Exceeds available ({formatCurrency(c.maxAmount, c.currency!)})
                  </p>
                )}
              </div>
            )}
          </div>
        </MobileAmountStepLayout>
      ),
    },
    {
      id: 'amount-hbp',
      visible: (c) => c.isHBP && !!c.currency,
      canProceed: (c) => c.parsedAmount > 0 && !c.exceedsAvailable,
      nextLabel: 'Continue',
      render: (c) => (
        <MobileAmountStepLayout
          account={c.account}
          footerNote={
            c.triggersConversion ? (
              <div className="rounded-xl border-2 border-amber-300 bg-amber-50 px-4 py-3 mb-2">
                <p className="text-sm text-amber-800">
                  Your request exceeds your {c.currency} balance. An automatic currency conversion will be applied.
                </p>
              </div>
            ) : undefined
          }
        >
          <MobileInfoBox>
            <p className="text-sm">
              Under the Home Buyers&apos; Plan, you can withdraw a maximum of{' '}
              <strong>{formatCurrency(c.hbpMax, c.currency || 'CAD')}</strong> from your RRSP.
            </p>
          </MobileInfoBox>
          <MobileCurrencyInput
            variant="hero"
            label="Gross withdrawal amount"
            value={c.amount}
            onChange={c.setAmount}
            max={c.hbpMax}
            maxLabel={formatCurrency(c.hbpMax, c.currency || 'CAD')}
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
      id: 'amount-llp',
      visible: (c) => c.isLLP && !!c.currency,
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
          <MobileInfoBox>
            <p className="text-[11px] leading-snug">
              LLP: <strong>{formatCurrency(c.llpLifetimeMax, c.currency || 'CAD')}</strong> lifetime;{' '}
              <strong>{formatCurrency(c.llpYearlyMax, c.currency || 'CAD')}</strong>/yr
            </p>
          </MobileInfoBox>
          <MobileCurrencyInput
            variant="hero"
            label="Gross withdrawal amount"
            value={c.amount}
            onChange={c.setAmount}
            max={c.llpYearlyMax}
            maxLabel={`${formatCurrency(c.llpYearlyMax, c.currency || 'CAD')} per calendar year`}
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
      visible: (c) => !c.isOvercontribution && c.parsedAmount > 0 && !c.exceedsAvailable,
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
        !c.isOvercontribution &&
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
        <div className="flex flex-col gap-4">
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
      id: 'hbp-t1036',
      visible: (c) => c.isHBP && c.bankReady,
      canProceed: (c) => c.hbpEligible === true,
      nextLabel: 'Continue',
      render: (c) => (
        <div className="flex flex-col gap-2">
          <div>
            <p className="font-semibold text-xs text-qt-primary mb-0.5">T1036 — HBP</p>
            <p className="text-[11px] text-qt-secondary leading-snug">
              Short questionnaire; pre-filled T1036 on the summary.
            </p>
          </div>
          <HBPEligibility onEligibilityChange={c.setHbpEligible} />
        </div>
      ),
    },
    {
      id: 'hbp-address',
      visible: (c) => c.isHBP && c.hbpEligible === true,
      canProceed: (c) => !!(c.address.street && c.address.city),
      nextLabel: 'Continue',
      render: (c) => <AddressInput value={c.address} onChange={c.setAddress} />,
    },
    {
      id: 'hbp-certify',
      visible: (c) => c.isHBP && c.hbpEligible === true && !!c.address.street,
      canProceed: (c) => (c.method === 'international_wire' ? true : c.signed) && c.confirmChecked,
      nextLabel: 'Continue',
      render: (c) => (
        <div className="flex flex-col gap-2">
          {c.method !== 'international_wire' && (
            <MobileESignature onSign={() => c.setSigned(true)} signed={c.signed} />
          )}
          <div className="border-2 border-qt-border rounded-lg p-3 bg-qt-bg-3">
            <p className="text-[11px] text-qt-primary leading-snug mb-2">
              I certify the information is correct and authorize this RRSP withdrawal.
            </p>
            <label className="flex items-start gap-2 min-h-0 cursor-pointer">
              <input
                type="checkbox"
                checked={c.confirmChecked}
                onChange={(e) => c.setConfirmChecked(e.target.checked)}
                className="mt-0.5 size-4 accent-qt-green cursor-pointer shrink-0"
              />
              <span className="text-xs font-semibold text-qt-primary leading-snug">I agree</span>
            </label>
          </div>
        </div>
      ),
    },
    {
      id: 'llp-rc96',
      visible: (c) => c.isLLP && c.bankReady,
      canProceed: (c) => c.llpEligible,
      nextLabel: 'Continue',
      render: (c) => (
        <div className="flex flex-col gap-2">
          <div>
            <p className="font-semibold text-xs text-qt-primary mb-0.5">RC96 — LLP</p>
            <p className="text-[11px] text-qt-secondary leading-snug">
              Questionnaire; pre-filled RC96 on the summary.
            </p>
          </div>
          <LLPEligibility
            onComplete={(elig, data) => {
              c.setLlpEligible(elig);
              c.setLlpData(data as unknown as Record<string, unknown>);
            }}
            withdrawalAmount={c.amount}
            onWithdrawalAmountChange={c.setAmount}
            currency={c.currency}
          />
        </div>
      ),
    },
    {
      id: 'llp-certify',
      visible: (c) => c.isLLP && c.llpEligible,
      canProceed: (c) => (c.method === 'international_wire' ? true : c.signed) && c.confirmChecked,
      nextLabel: 'Continue',
      render: (c) => (
        <div className="flex flex-col gap-2">
          {c.method !== 'international_wire' && (
            <MobileESignature onSign={() => c.setSigned(true)} signed={c.signed} />
          )}
          <div className="border-2 border-qt-border rounded-lg p-3 bg-qt-bg-3">
            <p className="text-[11px] text-qt-primary leading-snug mb-2">
              I certify the information is correct and authorize this RRSP withdrawal.
            </p>
            <label className="flex items-start gap-2 min-h-0 cursor-pointer">
              <input
                type="checkbox"
                checked={c.confirmChecked}
                onChange={(e) => c.setConfirmChecked(e.target.checked)}
                className="mt-0.5 size-4 accent-qt-green cursor-pointer shrink-0"
              />
              <span className="text-xs font-semibold text-qt-primary leading-snug">I agree</span>
            </label>
          </div>
        </div>
      ),
    },
    {
      id: 'review',
      visible: (c) =>
        !c.isOvercontribution &&
        ((c.isDeregistration && c.canContinueDeregistration) ||
          (c.isHBP && c.canContinueHBP) ||
          (c.isLLP && c.canContinueLLP)),
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
