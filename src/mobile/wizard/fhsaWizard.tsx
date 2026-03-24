import type { ReactNode } from 'react';
import type { Account, Currency, WithdrawalMethod, LinkedBank, InternationalWireData, FHSAWithdrawalType } from '../../types';
import type { MobileWizardStepDef } from './types';
import MobileAccountDropdown from '../components/MobileAccountDropdown';
import MobileCurrencySelector from '../components/MobileCurrencySelector';
import MobileCurrencyInput from '../components/MobileCurrencyInput';
import MobileMethodSelector from '../components/MobileMethodSelector';
import MobileBankSelector from '../components/MobileBankSelector';
import MobileInternationalWireForm from '../components/MobileInternationalWireForm';
import MobileESignature from '../components/MobileESignature';
import MobileInfoBox from '../components/MobileInfoBox';
import MobileRadioOption from '../components/MobileRadioOption';
import MobileWithdrawalTypeDropdown from '../components/MobileWithdrawalTypeDropdown';
import MobileAmountStepLayout from '../components/MobileAmountStepLayout';
import MobileOptionCards from '../components/MobileOptionCards';
import RRSPCalculator from '../../components/RRSPCalculator';
import FHSAEligibility from '../../components/FHSAEligibility';
import { formatCurrency, stripFormatting } from '../../data/accounts';

const fhsaOptions: { value: FHSAWithdrawalType; label: string; badge?: string }[] = [
  { value: 'qualifying', label: 'Qualifying (Home Purchase)' },
  { value: 'non_qualifying', label: 'Non-Qualifying', badge: 'Taxable' },
  { value: 'overcontribution', label: 'Overcontribution' },
];

export interface FhsaWizardCtx {
  accountOptions: Account[];
  rrspAccounts: Account[];
  account: Account | null;
  onAccountChange: (a: Account) => void;
  resetForm: () => void;
  fhsaType: FHSAWithdrawalType | '';
  setFhsaType: (t: FHSAWithdrawalType) => void;
  isQualifying: boolean;
  isNonQualifying: boolean;
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
  qualifyingEligible: boolean;
  setQualifyingEligible: (v: boolean) => void;
  qualifyingQuestionnaireComplete: boolean;
  setQualifyingQuestionnaireComplete: (v: boolean) => void;
  qualifyingData: Record<string, unknown>;
  setQualifyingData: (d: Record<string, unknown>) => void;
  ovpExcessAmount: string;
  setOvpExcessAmount: (v: string) => void;
  ovpSource: 'cash' | 'rrsp' | 'both' | null;
  setOvpSource: (v: 'cash' | 'rrsp' | 'both' | null) => void;
  ovpRemovalMethod: 'withdrawal' | 'transfer' | null;
  setOvpRemovalMethod: (v: 'withdrawal' | 'transfer' | null) => void;
  ovpTransferAccount: string | null;
  setOvpTransferAccount: (v: string | null) => void;
  ovpRemovalOptions: { value: 'withdrawal' | 'transfer'; label: string }[];
  ovpTransferReady: boolean;
  ovpTaxUnderstood: boolean;
  setOvpTaxUnderstood: (v: boolean) => void;
  ovpAgreed: boolean;
  setOvpAgreed: (v: boolean) => void;
  ovpSigned: boolean;
  setOvpSigned: (v: boolean) => void;
  fee: number;
  netAmount: number;
  withholdingTax: number;
  canContinueNonQualifying: boolean;
  canContinueOvercontribution: boolean;
  renderReviewSummary: () => ReactNode;
}

export function getFhsaWizardShellProgress(
  steps: { id: string }[],
  currentId: string,
): { stepIndex: number; totalSteps: number } {
  const n = steps.length;
  const totalSteps = Math.max(1, n - 1);
  const idx = steps.findIndex((s) => s.id === currentId);
  if (idx < 0) return { stepIndex: 0, totalSteps };
  if (idx <= 1) return { stepIndex: idx, totalSteps };
  if (idx <= 3) return { stepIndex: 2, totalSteps };
  return { stepIndex: idx - 1, totalSteps };
}

export function buildFhsaWizardSteps(): MobileWizardStepDef<FhsaWizardCtx>[] {
  return [
    {
      id: 'account',
      visible: () => true,
      canProceed: (c) => !!c.account && !!c.fhsaType && !!c.currency,
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
                onChange={(id) => c.setSelectedBank(id)}
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
            <MobileWithdrawalTypeDropdown<FHSAWithdrawalType>
              label="Withdrawal type"
              options={fhsaOptions}
              value={c.fhsaType}
              onChange={(v) => {
                const cur = c.currency;
                c.resetForm();
                c.setFhsaType(v);
                if (cur) c.setCurrency(cur);
              }}
            />
          )}
        </div>
      ),
    },
    {
      id: 'amount-nonqual',
      visible: (c) => c.isNonQualifying && !!c.currency,
      canProceed: (c) => c.grossAmount > 0 && !c.exceedsAvailable,
      nextLabel: 'Continue',
      render: (c) => (
        <MobileAmountStepLayout
          account={c.account}
          footerNote={
            c.grossAmount > 0 && c.triggersConversion ? (
              <div className="rounded-lg border border-amber-300 bg-amber-50 px-2 py-1.5 mb-1 shrink-0">
                <p className="text-[11px] leading-snug text-amber-800">
                  Exceeds {c.currency} cash — conversion will apply.
                </p>
              </div>
            ) : undefined
          }
        >
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
      id: 'amount-qual-ovp',
      visible: (c) => (c.isQualifying || c.isOvercontribution) && !!c.currency,
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
            label="Gross withdrawal amount"
            value={c.amount}
            onChange={(val) => {
              c.setAmount(val);
              if (c.isOvercontribution) c.setOvpExcessAmount(val);
            }}
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
      visible: (c) => !!c.fhsaType && c.parsedAmount > 0 && !c.exceedsAvailable,
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
                signed={c.signed}
                onSign={() => c.setSigned(true)}
              />
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
      id: 'fhsa-rc725',
      visible: (c) => c.isQualifying && c.bankReady,
      canProceed: (c) => c.qualifyingEligible || c.qualifyingQuestionnaireComplete,
      nextLabel: 'Continue',
      render: (c) => (
        <div className="flex flex-col gap-2">
          <div>
            <p className="font-semibold text-xs text-qt-primary mb-0.5">RC725 — Qualifying withdrawal</p>
            <p className="text-[11px] text-qt-secondary leading-snug">
              Short questionnaire; pre-filled RC725 on the summary.
            </p>
          </div>
          <FHSAEligibility
            onComplete={(elig, data) => {
              c.setQualifyingEligible(elig);
              c.setQualifyingData(data as unknown as Record<string, unknown>);
            }}
            onQuestionnaireComplete={c.setQualifyingQuestionnaireComplete}
            withdrawalAmount={c.amount}
            onWithdrawalAmountChange={c.setAmount}
          />
        </div>
      ),
    },
    {
      id: 'ovp-intro',
      visible: (c) => c.isOvercontribution && c.bankReady,
      canProceed: () => true,
      nextLabel: 'Continue',
      render: () => (
        <div className="flex flex-col gap-2">
          <div>
            <p className="font-semibold text-xs text-qt-primary mb-0.5">RC727 — Excess FHSA</p>
            <p className="text-[11px] text-qt-secondary leading-snug">
              Questionnaire; pre-filled RC727 on the summary.
            </p>
          </div>
          <div className="bg-qt-bg-3 rounded-lg p-2 flex flex-col gap-1">
            <p className="text-[10px] text-qt-secondary uppercase font-bold tracking-wide mb-0.5">Taxpayer</p>
            <div className="flex flex-col gap-1 text-[11px]">
              <div>
                <span className="text-qt-secondary">Name:</span>{' '}
                <span className="font-semibold text-qt-primary">Anastasia Carmichael</span>
              </div>
              <div>
                <span className="text-qt-secondary">SIN:</span>{' '}
                <span className="font-semibold text-qt-primary">•••-•••-123</span>
              </div>
              <div>
                <span className="text-qt-secondary">Address:</span>{' '}
                <span className="font-semibold text-qt-primary">42 Queen St W, Toronto ON</span>
              </div>
              <div>
                <span className="text-qt-secondary">Phone:</span>{' '}
                <span className="font-semibold text-qt-primary">(416) 555-0199</span>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'ovp-excess',
      visible: (c) => c.isOvercontribution && c.bankReady,
      canProceed: (c) => !!c.ovpExcessAmount && parseFloat(stripFormatting(c.ovpExcessAmount)) > 0,
      nextLabel: 'Continue',
      render: (c) => (
        <div className="flex flex-col gap-2">
          <p className="font-semibold text-sm text-qt-primary">
            How much is your excess FHSA amount (the amount you overcontributed)?
          </p>
          <MobileCurrencyInput label="Excess amount" value={c.ovpExcessAmount} onChange={c.setOvpExcessAmount} max={c.maxAmount} />
        </div>
      ),
    },
    {
      id: 'ovp-source',
      visible: (c) =>
        c.isOvercontribution &&
        c.bankReady &&
        !!c.ovpExcessAmount &&
        parseFloat(stripFormatting(c.ovpExcessAmount)) > 0,
      canProceed: (c) => !!c.ovpSource,
      nextLabel: 'Continue',
      render: (c) => (
        <div className="flex flex-col gap-3">
          <p className="font-semibold text-sm text-qt-primary">How did the excess money originally get into your FHSA?</p>
          <MobileRadioOption
            name="ovpSource"
            value="cash"
            label="I deposited cash directly from my bank account"
            checked={c.ovpSource === 'cash'}
            onChange={() => {
              c.setOvpSource('cash');
              c.setOvpRemovalMethod(null);
              c.setOvpTransferAccount(null);
            }}
          />
          <MobileRadioOption
            name="ovpSource"
            value="rrsp"
            label="I transferred the money in from my RRSP"
            checked={c.ovpSource === 'rrsp'}
            onChange={() => {
              c.setOvpSource('rrsp');
              c.setOvpRemovalMethod(null);
              c.setOvpTransferAccount(null);
            }}
          />
          <MobileRadioOption
            name="ovpSource"
            value="both"
            label="A mix of both cash deposits and RRSP transfers"
            checked={c.ovpSource === 'both'}
            onChange={() => {
              c.setOvpSource('both');
              c.setOvpRemovalMethod(null);
              c.setOvpTransferAccount(null);
            }}
          />
        </div>
      ),
    },
    {
      id: 'ovp-removal',
      visible: (c) => c.isOvercontribution && c.bankReady && !!c.ovpSource,
      canProceed: (c) => !!c.ovpRemovalMethod,
      nextLabel: 'Continue',
      render: (c) => (
        <div className="flex flex-col gap-3">
          <p className="font-semibold text-sm text-qt-primary">How would you like to remove these excess funds today?</p>
          {c.ovpRemovalOptions.map((opt) => (
            <MobileRadioOption
              key={opt.value}
              name="ovpRemoval"
              value={opt.value}
              label={opt.label}
              checked={c.ovpRemovalMethod === opt.value}
              onChange={() => {
                c.setOvpRemovalMethod(opt.value);
                c.setOvpTransferAccount(null);
              }}
            />
          ))}
        </div>
      ),
    },
    {
      id: 'ovp-transfer-account',
      visible: (c) => c.isOvercontribution && c.bankReady && c.ovpRemovalMethod === 'transfer',
      canProceed: (c) => !!c.ovpTransferAccount,
      nextLabel: 'Continue',
      render: (c) => (
        <MobileOptionCards<string>
          label="Which retirement account would you like to transfer the funds into?"
          options={c.rrspAccounts.map((a) => ({
            value: a.id,
            label: `${a.label} - ${a.accountNumber}`,
          }))}
          value={c.ovpTransferAccount}
          onChange={(id) => c.setOvpTransferAccount(id)}
        />
      ),
    },
    {
      id: 'ovp-tax',
      visible: (c) => c.isOvercontribution && c.bankReady && !!c.ovpRemovalMethod && c.ovpTransferReady,
      canProceed: (c) => c.ovpTaxUnderstood,
      nextLabel: 'Continue',
      render: (c) => (
        <div className="flex flex-col gap-2">
          <MobileInfoBox variant="warning">
            <div className="flex flex-col gap-0.5">
              <p className="font-semibold text-[11px]">Tax reminder</p>
              <p className="text-[11px] leading-snug">
                You must still file <strong>RC728</strong> for penalty months.
              </p>
            </div>
          </MobileInfoBox>
          <label className="flex items-start gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={c.ovpTaxUnderstood}
              onChange={(e) => c.setOvpTaxUnderstood(e.target.checked)}
              className="mt-0.5 size-4 accent-qt-green cursor-pointer shrink-0"
            />
            <span className="text-xs text-qt-primary leading-snug">I understand</span>
          </label>
        </div>
      ),
    },
    {
      id: 'ovp-esign',
      visible: (c) => c.isOvercontribution && c.bankReady && c.ovpTaxUnderstood,
      canProceed: (c) => c.ovpSigned,
      nextLabel: 'Continue',
      render: (c) => <MobileESignature onSign={() => c.setOvpSigned(true)} signed={c.ovpSigned} />,
    },
    {
      id: 'ovp-agree',
      visible: (c) => c.isOvercontribution && c.bankReady && c.ovpSigned,
      canProceed: (c) => c.ovpAgreed,
      nextLabel: 'Continue',
      render: (c) => (
        <div className="border-2 border-qt-border rounded-lg p-3 bg-qt-bg-3">
          <p className="text-[11px] text-qt-primary leading-snug mb-2">
            I certify the information is correct and authorize removal of my excess FHSA amount.
          </p>
          <label className="flex items-start gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={c.ovpAgreed}
              onChange={(e) => c.setOvpAgreed(e.target.checked)}
              className="mt-0.5 size-4 accent-qt-green cursor-pointer shrink-0"
            />
            <span className="text-xs font-semibold text-qt-primary leading-snug">I agree</span>
          </label>
        </div>
      ),
    },
    {
      id: 'review',
      visible: (c) =>
        (c.isQualifying &&
          !!c.currency &&
          c.parsedAmount > 0 &&
          !c.exceedsAvailable &&
          !!c.method &&
          c.bankReady &&
          (c.qualifyingEligible || c.qualifyingQuestionnaireComplete)) ||
        (c.isNonQualifying && c.canContinueNonQualifying) ||
        (c.isOvercontribution && c.canContinueOvercontribution),
      canProceed: () => true,
      nextLabel: 'Submit withdrawal',
      render: (c) => (
        <div className="flex flex-1 flex-col min-h-0 gap-2">
          <h2 className="font-semibold text-base text-[#333333] shrink-0">Review & confirm</h2>
          <div className="bg-white border border-[#E5E7EB] rounded-lg divide-y divide-[#E5E7EB] min-h-0 overflow-y-auto">{c.renderReviewSummary()}</div>
        </div>
      ),
    },
  ];
}
