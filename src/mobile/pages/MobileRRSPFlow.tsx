import { useState, useMemo, useCallback } from 'react';
import { useLinkedBankWithdrawalRules } from '../../hooks/useLinkedBankWithdrawalRules';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, ChevronLeft, Download } from 'lucide-react';
import MobileButton from '../components/MobileButton';
import MobileThreeStepProgress from '../components/MobileThreeStepProgress';
import { useWizardNavigation } from '../wizard/useWizardNavigation';
import { buildRrspWizardSteps, getRrspMacroStep, type RrspWizardCtx } from '../wizard/rrspWizard';
import {
  accounts,
  linkedBanks as defaultBanks,
  formatCurrency,
  FX_RATE,
  getLinkedBankDepositCurrency,
  getWithdrawalAmountStepData,
} from '../../data/accounts';
import { withdrawalMethodEtaSummary, withdrawalMethodSummaryLabel } from '../../lib/withdrawalMethodSummary';
import type { Account, Currency, WithdrawalMethod, LinkedBank, InternationalWireData, RRSPWithdrawalType } from '../../types';

const STEP_TITLES = ['Account information', 'Withdrawal Details', 'Review and Confirm'] as const;

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-2 px-3 py-2.5">
      <p className="text-xs text-qt-secondary shrink-0">{label}</p>
      <p className="text-xs font-semibold text-qt-primary text-right max-w-[58%] break-words">{value}</p>
    </div>
  );
}

export default function MobileRRSPFlow() {
  const navigate = useNavigate();
  const [account, setAccount] = useState<Account | null>(() => accounts.find((a) => a.type === 'RRSP') ?? null);

  const [rrspType, setRrspType] = useState<RRSPWithdrawalType | ''>('');
  const [grossAmount, setGrossAmount] = useState(0);
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState<WithdrawalMethod>('eft');
  const [selectedBank, setSelectedBank] = useState<string | null>(null);
  const [allBanks, setAllBanks] = useState<LinkedBank[]>(defaultBanks);
  const [intlWire, setIntlWire] = useState<InternationalWireData>({
    firstName: 'Anastasia', lastName: 'Carmichael',
    currency: 'CAD', amount: '', reason: '',
    bankName: '', bankAddress: '', bankCity: '', bankCountry: '',
    swiftCode: '', bankAccountNumber: '',
    hasIntermediary: false, intermediaryBankName: '',
    intermediarySwiftCode: '', intermediaryAccountNumber: '',
    routingNumber: '',
    isBrokerage: false, brokerageName: '',
    brokerageAccountName: '', brokerageAccountNumber: '',
  });
  const [signed, setSigned] = useState(false);
  const [hbpEligible, setHbpEligible] = useState<boolean | null>(null);
  const [hbpNonResidentIneligible, setHbpNonResidentIneligible] = useState(false);
  const [llpEligible, setLlpEligible] = useState(false);
  const [llpData, setLlpData] = useState<Record<string, unknown>>({});
  const [address, setAddress] = useState({ street: '', city: '', province: '', postalCode: '' });
  const [confirmChecked, setConfirmChecked] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const wizardSteps = useMemo(() => buildRrspWizardSteps(), []);

  const { methodDisabled, bank } = useLinkedBankWithdrawalRules(allBanks, selectedBank, setMethod, setIntlWire);

  const withdrawalCurrency: Currency = useMemo(() => {
    if (method === 'international_wire') return intlWire.currency;
    return getLinkedBankDepositCurrency(bank);
  }, [method, intlWire.currency, bank]);

  const withdrawalAmountStepData = useMemo(
    () => (account ? getWithdrawalAmountStepData(account, withdrawalCurrency) : null),
    [account, withdrawalCurrency],
  );

  const resetWithdrawalDetails = useCallback(() => {
    setAmount('');
    setGrossAmount(0);
    setHbpEligible(null);
    setHbpNonResidentIneligible(false);
    setLlpEligible(false);
    setLlpData({});
    setSigned(false);
    setConfirmChecked(false);
    setAddress({ street: '', city: '', province: '', postalCode: '' });
  }, []);

  const resetForm = useCallback(() => {
    setRrspType('');
    resetWithdrawalDetails();
    setMethod('eft');
    setSelectedBank(null);
    setIntlWire({
      firstName: 'Anastasia', lastName: 'Carmichael',
      currency: 'CAD', amount: '', reason: '',
      bankName: '', bankAddress: '', bankCity: '', bankCountry: '',
      swiftCode: '', bankAccountNumber: '',
      hasIntermediary: false, intermediaryBankName: '',
      intermediarySwiftCode: '', intermediaryAccountNumber: '',
      routingNumber: '',
      isBrokerage: false, brokerageName: '',
      brokerageAccountName: '', brokerageAccountNumber: '',
    });
  }, [resetWithdrawalDetails]);

  const handleAccountChange = useCallback(
    (acct: Account) => {
      if (acct.type === 'FHSA') {
        navigate('/fhsa');
        return;
      }
      if (acct.type === 'RESP') {
        navigate('/resp');
        return;
      }
      if (acct.type !== 'RRSP') {
        navigate('/');
        return;
      }
      setAccount(acct);
      setRrspType('');
      resetWithdrawalDetails();
    },
    [navigate, resetWithdrawalDetails],
  );

  const isDeregistration = rrspType === 'deregistration';
  const isHBP = rrspType === 'hbp';
  const isLLP = rrspType === 'llp';
  const isOvercontribution = rrspType === 'overcontribution';

  const maxAmount = withdrawalAmountStepData?.combinedMaxInPrimary ?? 0;
  const parsedAmount = parseFloat(amount) || 0;
  const activeAmount = isDeregistration ? grossAmount : parsedAmount;
  const exceedsAvailable = activeAmount > maxAmount && activeAmount > 0;
  const singleCurrencyBalance = withdrawalAmountStepData?.availableBalance ?? 0;
  const triggersConversion =
    !isDeregistration &&
    parsedAmount > singleCurrencyBalance &&
    !exceedsAvailable &&
    parsedAmount > 0;
  const fee =
    method === 'wire' ? (withdrawalCurrency === 'USD' ? 30 : 20) : method === 'international_wire' ? 40 : 0;

  const hbpMax = withdrawalCurrency === 'USD' ? 60000 / FX_RATE : 60000;
  const llpYearlyMax = withdrawalCurrency === 'USD' ? 10000 / FX_RATE : 10000;
  const llpLifetimeMax = withdrawalCurrency === 'USD' ? 20000 / FX_RATE : 20000;

  const bankReady =
    method === 'international_wire'
      ? !!(
          selectedBank &&
          intlWire.bankName?.trim() &&
          intlWire.swiftCode?.trim() &&
          signed
        )
      : !!selectedBank;

  const taxBase = isDeregistration ? grossAmount : parsedAmount;
  const withholdingTax = isDeregistration
    ? taxBase <= 5000
      ? taxBase * 0.1
      : taxBase <= 15000
        ? taxBase * 0.2
        : taxBase * 0.3
    : 0;
  const net = taxBase - withholdingTax - fee;

  const canContinueDeregistration =
    grossAmount > 0 && !exceedsAvailable && !!method && !!bankReady;
  const canContinueHBP =
    parsedAmount > 0 &&
    !exceedsAvailable &&
    !!method &&
    !!bankReady &&
    confirmChecked &&
    ((hbpEligible === true &&
      !!address.street &&
      !!address.city &&
      (method === 'international_wire' || signed)) ||
      hbpEligible === false);
  const canContinueLLP =
    parsedAmount > 0 &&
    !exceedsAvailable &&
    !!method &&
    !!bankReady &&
    confirmChecked &&
    llpEligible &&
    (method === 'international_wire' || signed);

  const withdrawalTypeLabel = isHBP
    ? "Home Buyer's Plan"
    : isLLP
      ? 'Lifelong Learning Plan'
      : isOvercontribution
        ? 'Overcontribution'
        : 'Deregistration';

  const llpStudent =
    llpData.student === 'spouse'
      ? `${String(llpData.spouseFirstName || '')} ${String(llpData.spouseLastName || '')}`.trim()
      : `${String(llpData.firstName || 'Anastasia')} ${String(llpData.lastName || 'Carmichael')} (You)`;

  const renderReviewSummary = useCallback(() => {
    if (!account) return null;
    const methodSummaryLabel = withdrawalMethodSummaryLabel(method);
    const methodEta = withdrawalMethodEtaSummary(method);
    const reviewAmount = isDeregistration ? grossAmount : parsedAmount;
    return (
      <>
        {isHBP && hbpEligible === true && (
          <>
            <SummaryRow label="Legal name" value="Anastasia Carmichael" />
            <SummaryRow
              label="Address of qualifying home"
              value={`${address.street}, ${address.city}, ${address.province} ${address.postalCode}`}
            />
          </>
        )}
        {isLLP && (
          <>
            <SummaryRow label="Account holder" value="Anastasia Carmichael" />
            <SummaryRow label="LLP student" value={llpStudent} />
          </>
        )}
        <SummaryRow label="Account" value={`${account.label} - ${account.accountNumber}`} />
        <SummaryRow label="Withdrawal type" value={withdrawalTypeLabel} />
        <SummaryRow label="Currency" value={withdrawalCurrency} />
        <SummaryRow label="Withdrawal amount" value={formatCurrency(reviewAmount, withdrawalCurrency)} />
        {isDeregistration && (
          <SummaryRow label="Withholding tax" value={`-${formatCurrency(withholdingTax, withdrawalCurrency)}`} />
        )}
        {(isHBP || isLLP) && <SummaryRow label="Withholding tax" value="$0.00" />}
        <SummaryRow label="Method" value={methodSummaryLabel} />
        {methodEta ? <SummaryRow label="ETA" value={methodEta} /> : null}
        {fee > 0 && <SummaryRow label="Fee" value={`-${formatCurrency(fee, withdrawalCurrency)}`} />}
        {method !== 'international_wire' && bank && (
          <SummaryRow label="Bank" value={`${bank.name} - ****${bank.last4}`} />
        )}
        {method === 'international_wire' && (
          <>
            <SummaryRow label="International bank" value={intlWire.bankName} />
            <SummaryRow label="SWIFT code" value={intlWire.swiftCode} />
          </>
        )}
        <div className="flex items-center justify-between px-4 py-4 bg-qt-bg-3">
          <p className="font-semibold text-base text-qt-primary">Net amount</p>
          <p className="font-semibold text-lg text-qt-green-dark">{formatCurrency(Math.max(0, net), withdrawalCurrency)}</p>
        </div>
        <div className="px-4 py-4">
          <p className="text-xs font-semibold text-qt-secondary uppercase tracking-wider mb-2">Forms</p>
          <MobileButton
            variant="secondary"
            type="button"
            className="w-full"
            onClick={() => {
              const blob = new Blob(['RRSP withdrawal — demo PDF'], { type: 'application/pdf' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = 'rrsp-withdrawal-summary.pdf';
              a.click();
              URL.revokeObjectURL(url);
            }}
          >
            <span className="inline-flex items-center gap-2">
              <Download size={18} />
              Download PDF summary
            </span>
          </MobileButton>
        </div>
      </>
    );
  }, [
    account,
    address.city,
    address.postalCode,
    address.province,
    address.street,
    bank,
    fee,
    grossAmount,
    hbpEligible,
    intlWire.bankName,
    intlWire.swiftCode,
    isDeregistration,
    isHBP,
    isLLP,
    llpStudent,
    method,
    net,
    parsedAmount,
    withholdingTax,
    withdrawalCurrency,
    withdrawalTypeLabel,
  ]);

  const ctx = useMemo<RrspWizardCtx>(
    () => ({
      accountOptions: accounts,
      account,
      onAccountChange: handleAccountChange,
      onNavigateHome: () => navigate('/'),
      resetForm,
      resetWithdrawalDetails,
      rrspType,
      setRrspType,
      isDeregistration,
      isHBP,
      isLLP,
      isOvercontribution,
      maxAmount,
      currency: withdrawalCurrency,
      withdrawalAmountStepData,
      amount,
      setAmount,
      grossAmount,
      setGrossAmount,
      parsedAmount,
      exceedsAvailable,
      triggersConversion,
      hbpMax,
      llpYearlyMax,
      llpLifetimeMax,
      method,
      setMethod,
      selectedBank,
      setSelectedBank,
      allBanks,
      setAllBanks,
      intlWire,
      setIntlWire,
      signed,
      setSigned,
      bankReady,
      hbpEligible,
      setHbpEligible,
      hbpNonResidentIneligible,
      setHbpNonResidentIneligible,
      address,
      setAddress,
      llpEligible,
      setLlpEligible,
      llpData,
      setLlpData,
      confirmChecked,
      setConfirmChecked,
      fee,
      withholdingTax,
      net,
      canContinueDeregistration,
      canContinueHBP,
      canContinueLLP,
      renderReviewSummary,
      methodDisabled,
    }),
    [
      account,
      address,
      allBanks,
      amount,
      bankReady,
      canContinueDeregistration,
      canContinueHBP,
      canContinueLLP,
      confirmChecked,
      exceedsAvailable,
      fee,
      grossAmount,
      handleAccountChange,
      hbpEligible,
      hbpNonResidentIneligible,
      hbpMax,
      intlWire,
      isDeregistration,
      isHBP,
      isLLP,
      isOvercontribution,
      llpData,
      llpEligible,
      llpLifetimeMax,
      llpYearlyMax,
      maxAmount,
      method,
      methodDisabled,
      navigate,
      net,
      parsedAmount,
      renderReviewSummary,
      resetForm,
      resetWithdrawalDetails,
      rrspType,
      selectedBank,
      signed,
      triggersConversion,
      withholdingTax,
      withdrawalAmountStepData,
      withdrawalCurrency,
    ],
  );

  const resetKey = account?.id ?? 'none';
  const nav = useWizardNavigation(wizardSteps, ctx, resetKey);

  const handleSubmit = useCallback(() => {
    setSubmitted(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const current = nav.currentStep;
  const primaryLabel =
    typeof current?.nextLabel === 'function' ? current.nextLabel(ctx) : current?.nextLabel ?? 'Continue';
  const canProceed = current ? current.canProceed(ctx) : false;

  const macroStep = current ? getRrspMacroStep(current.id) : 0;

  const handlePrimary = useCallback(() => {
    if (!current) return;
    if (nav.stepIndex < nav.totalSteps - 1) {
      nav.goNext();
    } else {
      handleSubmit();
    }
  }, [current, nav, handleSubmit]);

  if (submitted && account) {
    return (
      <div className="flex flex-col min-h-0 px-4 py-8 flex-1 overflow-x-hidden">
        <p className="text-xs font-semibold text-[#78899F] text-center mb-2">Complete</p>
        <div className="size-20 rounded-full bg-qt-green-bg flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 size={40} className="text-qt-green" />
        </div>
        <h2 className="font-semibold text-2xl leading-tight text-qt-primary mb-3 text-center">Withdrawal submitted</h2>
        <div className="bg-white border border-[#E5E7EB] rounded-lg divide-y divide-[#E5E7EB] mb-6 max-w-full">
          {renderReviewSummary()}
        </div>
        <p className="text-base text-qt-secondary leading-6 mb-2 text-center">
          Your {withdrawalTypeLabel} withdrawal request has been submitted.
        </p>
        <p className="text-sm text-qt-secondary leading-[22px] mb-8 text-center">
          Processing typically takes 1–3 business days. You&apos;ll receive a confirmation email shortly.
        </p>
        <MobileButton
          onClick={() => {
            setSubmitted(false);
            setAccount(accounts.find((a) => a.type === 'RRSP') ?? null);
            resetForm();
            nav.setStepIndex(0);
          }}
        >
          Start new withdrawal
        </MobileButton>
      </div>
    );
  }

  if (!current) {
    return (
      <div className="flex flex-1 flex-col justify-center px-4 py-8 text-center text-sm text-qt-secondary">
        <p className="font-semibold text-qt-primary mb-1">Loading wizard…</p>
        <p>If this doesn&apos;t go away, refresh the page.</p>
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 w-full flex-1 flex-col overflow-hidden">
      <div className="relative shrink-0">
        {nav.stepIndex > 0 && (
          <button
            type="button"
            onClick={nav.goBack}
            className="absolute left-[length:var(--ads-size-xxs)] top-3 z-10 flex size-9 items-center justify-center rounded-full text-[var(--ads-color-body-contrast-100)] active:bg-qt-bg-3 cursor-pointer"
            aria-label="Back"
          >
            <ChevronLeft className="size-[18px]" strokeWidth={2.25} aria-hidden />
          </button>
        )}
        <div className="flex flex-col items-start gap-[length:var(--ads-size-xxxs)] self-stretch px-[length:var(--ads-size-xxs)] pb-2 pt-2">
          <h1 className="w-full text-center font-[family-name:var(--ads-font-family-body)] text-[length:var(--ads-font-size-s)] font-semibold leading-[length:var(--ads-font-line-height-s)] text-[var(--ads-color-body-contrast-100)]">
            {STEP_TITLES[macroStep]}
          </h1>
          <MobileThreeStepProgress step={macroStep} />
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-[length:var(--ads-size-xxs)] pt-2 pb-4">
        {current.render(ctx)}
      </div>

      {!current.hideFooter && (
        <div className="shrink-0 px-[length:var(--ads-size-xxs)] pt-2 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          <div className="mx-auto flex w-full max-w-[357px] flex-col">
            <MobileButton
              onClick={handlePrimary}
              disabled={!canProceed}
              fullWidth
              className="!h-[length:var(--ads-size-xl)] !min-h-[length:var(--ads-size-xl)] !gap-[length:var(--ads-size-nano)] !rounded-[length:var(--ads-border-radius-xl)] !bg-[var(--ads-color-primary-500)] !px-[length:var(--ads-size-s)] !py-[length:var(--ads-size-quark)] !text-base text-white active:opacity-90"
            >
              {primaryLabel}
            </MobileButton>
          </div>
        </div>
      )}
    </div>
  );
}
