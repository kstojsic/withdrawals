import type { Dispatch, ReactNode, SetStateAction } from 'react';
import type { Account, Currency, WithdrawalMethod, LinkedBank, InternationalWireData, RRSPWithdrawalType } from '../../types';
import type { MobileWizardStepDef } from './types';
import type { WithdrawalAmountStepData } from '../../data/accounts';
import MobileAccountDropdown from '../components/MobileAccountDropdown';
import MobileBankDepositDropdown from '../components/MobileBankDepositDropdown';
import MobileWithdrawalMethodDropdown from '../components/MobileWithdrawalMethodDropdown';
import MobileInternationalWireForm from '../components/MobileInternationalWireForm';
import MobileESignature from '../components/MobileESignature';
import MobileWithdrawalTypeDropdown from '../components/MobileWithdrawalTypeDropdown';
import MobileInfoBox from '../components/MobileInfoBox';
import MobileButton from '../components/MobileButton';
import MobileWithdrawAvailableSummary from '../components/MobileWithdrawAvailableSummary';
import { MobileWithdrawalAmountField } from '../components/MobileWithdrawalAmountStep';
import RRSPCalculator from '../../components/RRSPCalculator';
import HBPEligibility from '../../components/HBPEligibility';
import LLPEligibility from '../../components/LLPEligibility';
import AddressInput from '../../components/AddressInput';
import { formatCurrency, type WithdrawalMethodDisableFlags } from '../../data/accounts';

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
  /** Clears amounts & type-specific questionnaire state; keeps deposit bank, method, and intl wire. */
  resetWithdrawalDetails: () => void;

  rrspType: RRSPWithdrawalType | '';
  setRrspType: (t: RRSPWithdrawalType) => void;

  isDeregistration: boolean;
  isHBP: boolean;
  isLLP: boolean;
  isOvercontribution: boolean;

  maxAmount: number;
  /** Withdrawal denomination: deposit bank currency, or wire currency when international wire (matches FHSA mobile). */
  currency: Currency;
  withdrawalAmountStepData: WithdrawalAmountStepData | null;
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

  method: WithdrawalMethod;
  setMethod: Dispatch<SetStateAction<WithdrawalMethod>>;
  selectedBank: string | null;
  setSelectedBank: (id: string | null) => void;
  allBanks: LinkedBank[];
  setAllBanks: (b: LinkedBank[]) => void;
  intlWire: InternationalWireData;
  setIntlWire: Dispatch<SetStateAction<InternationalWireData>>;
  signed: boolean;
  setSigned: (v: boolean) => void;

  bankReady: boolean;
  hbpEligible: boolean | null;
  setHbpEligible: (v: boolean | null) => void;
  hbpNonResidentIneligible: boolean;
  setHbpNonResidentIneligible: (v: boolean) => void;
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

  methodDisabled: WithdrawalMethodDisableFlags;
}

/**
 * Maps the inner RRSP wizard screen to the three macro phases shared with FHSA / Standard mobile
 * (Account information → Withdrawal Details → Review and Confirm).
 */
export function getRrspMacroStep(currentId: string): 0 | 1 | 2 {
  if (currentId === 'account' || currentId === 'ovp-instructions') return 0;
  if (currentId === 'review') return 2;
  return 1;
}

export function buildRrspWizardSteps(): MobileWizardStepDef<RrspWizardCtx>[] {
  return [
    {
      id: 'account',
      visible: () => true,
      canProceed: (c) =>
        !!c.account &&
        !!c.rrspType &&
        !!c.selectedBank &&
        !!c.method &&
        (c.method !== 'international_wire' ||
          !!(c.intlWire.bankName?.trim() && c.intlWire.swiftCode?.trim() && c.signed)),
      nextLabel: 'Continue',
      render: (c) => (
        <div className="flex flex-1 flex-col min-h-0 gap-3 justify-start">
          <p className="text-[11px] font-medium text-qt-primary leading-tight">Tell us where to send your funds.</p>
          <MobileAccountDropdown
            accounts={c.accountOptions}
            value={c.account?.id ?? null}
            onChange={c.onAccountChange}
          />
          {c.account && (
            <>
              <MobileBankDepositDropdown
                value={c.selectedBank}
                onChange={c.setSelectedBank}
                allBanks={c.allBanks}
                onBanksChange={c.setAllBanks}
              />
              <MobileWithdrawalMethodDropdown
                value={c.method ?? 'eft'}
                onChange={(m) => {
                  c.setMethod(m);
                  c.setSigned(false);
                  if (m !== 'international_wire') {
                    c.setIntlWire((d) => ({ ...d, currency: 'CAD' }));
                  }
                }}
                currencyHint={c.currency}
                methodDisabled={c.methodDisabled}
              />
              <MobileWithdrawalTypeDropdown<RRSPWithdrawalType>
                label="Withdrawal type"
                options={rrspOptions}
                value={c.rrspType}
                onChange={(v) => {
                  c.resetWithdrawalDetails();
                  c.setRrspType(v);
                }}
              />
              {c.method === 'international_wire' && (
                <MobileInternationalWireForm
                  currency={c.currency}
                  amount={c.amount}
                  data={c.intlWire}
                  onChange={c.setIntlWire}
                  signed={c.signed}
                  onSign={() => c.setSigned(true)}
                />
              )}
            </>
          )}
        </div>
      ),
    },
    {
      id: 'ovp-instructions',
      visible: (c) => c.isOvercontribution && !!c.account && !!c.selectedBank,
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
      visible: (c) => c.isDeregistration && !!c.account && !!c.withdrawalAmountStepData,
      canProceed: (c) => c.grossAmount > 0 && !c.exceedsAvailable,
      nextLabel: 'Continue',
      render: (c) => {
        const d = c.withdrawalAmountStepData;
        if (!d) return null;
        return (
          <div className="flex w-full max-w-[357px] flex-col gap-4">
            <MobileWithdrawAvailableSummary
              primaryCurrency={d.primaryCurrency}
              availableBalance={d.availableBalance}
              unavailableBalance={d.unavailableBalance}
              secondaryCurrency={d.secondaryCurrency}
              secondaryBalance={d.secondaryBalance}
              maxFromSecondaryInPrimary={d.maxFromSecondaryInPrimary}
              combinedMaxInPrimary={d.combinedMaxInPrimary}
            />
            <RRSPCalculator
              compact
              currency={c.currency}
              onAmountChange={(g) => {
                c.setGrossAmount(g);
                c.setAmount(g > 0 ? g.toFixed(2) : '');
              }}
            />
            {c.grossAmount > 0 && (
              <div className="rounded-lg bg-qt-bg-3 px-3 py-2">
                <p className="text-[10px] text-qt-secondary">Withdrawal amount (gross)</p>
                <p className="text-sm font-semibold text-qt-primary tabular-nums">
                  {formatCurrency(c.grossAmount, c.currency)}
                </p>
                {c.exceedsAvailable && (
                  <p className="mt-1 text-xs font-semibold text-qt-red">
                    Exceeds available ({formatCurrency(c.maxAmount, c.currency)})
                  </p>
                )}
              </div>
            )}
            {c.grossAmount > d.availableBalance && c.grossAmount > 0 && !c.exceedsAvailable && (
              <div
                className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-3 text-[11px] leading-relaxed text-amber-950"
                role="status"
              >
                Your request exceeds your {d.primaryCurrency} balance. An automatic currency conversion will be applied
                to cover the difference.
              </div>
            )}
          </div>
        );
      },
    },
    {
      id: 'amount-hbp',
      visible: (c) => c.isHBP && !!c.account && !!c.withdrawalAmountStepData,
      canProceed: (c) => c.parsedAmount > 0 && !c.exceedsAvailable,
      nextLabel: 'Continue',
      render: (c) => {
        const d = c.withdrawalAmountStepData;
        if (!d) return null;
        return (
          <div className="flex w-full max-w-[357px] flex-col gap-4">
            <MobileWithdrawAvailableSummary
              primaryCurrency={d.primaryCurrency}
              availableBalance={d.availableBalance}
              unavailableBalance={d.unavailableBalance}
              secondaryCurrency={d.secondaryCurrency}
              secondaryBalance={d.secondaryBalance}
              maxFromSecondaryInPrimary={d.maxFromSecondaryInPrimary}
              combinedMaxInPrimary={d.combinedMaxInPrimary}
            />
            <MobileInfoBox>
              <p className="text-[11px] leading-snug">
                Under the Home Buyers&apos; Plan, you can withdraw a maximum of{' '}
                <strong>{formatCurrency(c.hbpMax, c.currency)}</strong> from your RRSP.
              </p>
            </MobileInfoBox>
            <MobileWithdrawalAmountField
              primaryCurrency={c.currency}
              value={c.amount}
              onChange={c.setAmount}
              max={c.hbpMax}
              maxLabel={formatCurrency(c.hbpMax, c.currency)}
              error={
                c.exceedsAvailable
                  ? `Amount exceeds available balance of ${formatCurrency(c.maxAmount, c.currency)}`
                  : undefined
              }
              inputId="rrsp-hbp-withdrawal-amount"
            />
            {c.triggersConversion && (
              <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-3 text-[11px] leading-relaxed text-amber-950">
                Your request exceeds your {c.currency} balance. An automatic currency conversion will be applied.
              </div>
            )}
          </div>
        );
      },
    },
    {
      id: 'amount-llp',
      visible: (c) => c.isLLP && !!c.account && !!c.withdrawalAmountStepData,
      canProceed: (c) => c.parsedAmount > 0 && !c.exceedsAvailable,
      nextLabel: 'Continue',
      render: (c) => {
        const d = c.withdrawalAmountStepData;
        if (!d) return null;
        return (
          <div className="flex w-full max-w-[357px] flex-col gap-4">
            <MobileWithdrawAvailableSummary
              primaryCurrency={d.primaryCurrency}
              availableBalance={d.availableBalance}
              unavailableBalance={d.unavailableBalance}
              secondaryCurrency={d.secondaryCurrency}
              secondaryBalance={d.secondaryBalance}
              maxFromSecondaryInPrimary={d.maxFromSecondaryInPrimary}
              combinedMaxInPrimary={d.combinedMaxInPrimary}
            />
            <MobileInfoBox>
              <p className="text-[11px] leading-snug">
                LLP: <strong>{formatCurrency(c.llpLifetimeMax, c.currency)}</strong> lifetime;{' '}
                <strong>{formatCurrency(c.llpYearlyMax, c.currency)}</strong>/yr
              </p>
            </MobileInfoBox>
            <MobileWithdrawalAmountField
              primaryCurrency={c.currency}
              value={c.amount}
              onChange={c.setAmount}
              max={c.llpYearlyMax}
              maxLabel={`${formatCurrency(c.llpYearlyMax, c.currency)} per calendar year`}
              error={
                c.exceedsAvailable
                  ? `Amount exceeds available balance of ${formatCurrency(c.maxAmount, c.currency)}`
                  : undefined
              }
              inputId="rrsp-llp-withdrawal-amount"
            />
            {c.triggersConversion && (
              <div className="rounded-lg border border-amber-300 bg-amber-50 px-2 py-1.5 shrink-0">
                <p className="text-[11px] leading-snug text-amber-800">
                  Exceeds {c.currency} cash — conversion will apply.
                </p>
              </div>
            )}
          </div>
        );
      },
    },
    {
      id: 'hbp-t1036',
      visible: (c) => c.isHBP && c.bankReady,
      canProceed: (c) =>
        c.hbpEligible === true || (c.hbpEligible === false && !c.hbpNonResidentIneligible),
      nextLabel: 'Continue',
      render: (c) => (
        <div className="flex flex-col gap-2">
          <div>
            <p className="font-semibold text-xs text-qt-primary mb-0.5">T1036 — HBP</p>
            <p className="text-[11px] text-qt-secondary leading-snug">
              Short questionnaire; pre-filled T1036 on the summary.
            </p>
          </div>
          <HBPEligibility
            onEligibilityChange={(elig, meta) => {
              c.setHbpEligible(elig);
              c.setHbpNonResidentIneligible(!!meta?.nonResidentIneligible);
            }}
          />
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
      id: 'hbp-not-eligible-ack',
      visible: (c) => c.isHBP && c.hbpEligible === false && !c.hbpNonResidentIneligible,
      canProceed: (c) => c.confirmChecked,
      nextLabel: 'Continue',
      render: (c) => (
        <div className="flex flex-col gap-2">
          <MobileInfoBox variant="warning">
            <p className="text-[11px] text-qt-primary leading-snug">
              Based on your answers, you do not appear to be eligible for the Home Buyers&apos; Plan. You can still
              continue if you want this withdrawal processed for review.
            </p>
          </MobileInfoBox>
          <div className="border-2 border-qt-border rounded-lg p-3 bg-qt-bg-3">
            <p className="text-[11px] text-qt-primary leading-snug mb-2">
              I understand the above and want to continue with my withdrawal request.
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
      render: (c) => {
        const reviewAmt = c.isDeregistration ? c.grossAmount : c.parsedAmount;
        return (
        <div className="flex flex-1 flex-col min-h-0 gap-2">
          <p className="text-sm text-qt-secondary">Check the details below before submitting.</p>
          <div className="min-h-0 max-h-full divide-y divide-figma-neutral-100 overflow-y-auto overflow-x-hidden rounded-xl border border-figma-neutral-100 bg-figma-neutral-00">
            {c.renderReviewSummary()}
          </div>
          {((c.currency === 'CAD' && reviewAmt > 50000) || (c.currency === 'USD' && reviewAmt > 25000)) && (
            <div className="px-2 py-1.5 bg-amber-50 border border-amber-200 rounded-lg shrink-0">
              <p className="text-[11px] leading-snug text-amber-800">
                Over $50k CAD / $25k USD — split into multiple withdrawals.
              </p>
            </div>
          )}
        </div>
        );
      },
    },
  ];
}
