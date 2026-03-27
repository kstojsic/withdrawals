import { useState, useMemo, useCallback, useEffect } from 'react';
import { useLinkedBankWithdrawalRules } from '../../hooks/useLinkedBankWithdrawalRules';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, ChevronLeft, Download } from 'lucide-react';
import MobileButton from '../components/MobileButton';
import MobileAccountSelectionList from '../components/MobileAccountSelectionList';
import MobileBankDepositDropdown from '../components/MobileBankDepositDropdown';
import MobileWithdrawalMethodDropdown from '../components/MobileWithdrawalMethodDropdown';
import MobileWithdrawalTypeDropdown from '../components/MobileWithdrawalTypeDropdown';
import MobileThreeStepProgress from '../components/MobileThreeStepProgress';
import MobileWithdrawalAmountStep from '../components/MobileWithdrawalAmountStep';
import MobileWithdrawAvailableSummary from '../components/MobileWithdrawAvailableSummary';
import MobileInternationalWireForm from '../components/MobileInternationalWireForm';
import MobileESignature from '../components/MobileESignature';
import MobileRadioOption from '../components/MobileRadioOption';
import MobileOptionCards from '../components/MobileOptionCards';
import MobileInfoBox from '../components/MobileInfoBox';
import MobileCurrencyInput from '../components/MobileCurrencyInput';
import RRSPCalculator from '../../components/RRSPCalculator';
import FHSAEligibility from '../../components/FHSAEligibility';
import {
  accounts,
  linkedBanks as defaultBanks,
  formatCurrency,
  getLinkedBankDepositCurrency,
  getWithdrawalAmountStepData,
  stripFormatting,
  calculateWithholdingTax,
} from '../../data/accounts';
import { withdrawalMethodEtaSummary, withdrawalMethodSummaryLabel } from '../../lib/withdrawalMethodSummary';
import type { Account, Currency, WithdrawalMethod, LinkedBank, InternationalWireData, FHSAWithdrawalType } from '../../types';

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-2 px-3 py-2.5">
      <p className="text-xs text-qt-secondary shrink-0">{label}</p>
      <p className="text-xs font-semibold text-qt-primary text-right max-w-[58%] break-words">{value}</p>
    </div>
  );
}

const STEP_TITLES = ['Account information', 'Withdrawal Details', 'Review and Confirm'] as const;

const FHSA_TYPE_OPTIONS: { value: FHSAWithdrawalType; label: string; badge?: string }[] = [
  { value: 'qualifying', label: 'Qualifying (Home Purchase)' },
  { value: 'non_qualifying', label: 'Non-Qualifying', badge: 'Taxable' },
  { value: 'overcontribution', label: 'Overcontribution' },
];

const defaultIntl: InternationalWireData = {
  firstName: 'Anastasia',
  lastName: 'Carmichael',
  currency: 'CAD',
  amount: '',
  reason: '',
  bankName: '',
  bankAddress: '',
  bankCity: '',
  bankCountry: '',
  swiftCode: '',
  bankAccountNumber: '',
  hasIntermediary: false,
  intermediaryBankName: '',
  intermediarySwiftCode: '',
  intermediaryAccountNumber: '',
  routingNumber: '',
  isBrokerage: false,
  brokerageName: '',
  brokerageAccountName: '',
  brokerageAccountNumber: '',
};

export default function MobileFHSAFlow() {
  const navigate = useNavigate();
  const rrspAccounts = useMemo(() => accounts.filter((a) => a.type === 'RRSP'), []);

  const [step, setStep] = useState<0 | 1 | 2>(0);
  /** Step 0: 0 = choose account (list), 1 = bank / method / withdrawal type. */
  const [accountInfoSubStep, setAccountInfoSubStep] = useState<0 | 1>(0);
  const [account, setAccount] = useState<Account | null>(null);
  const [fhsaType, setFhsaType] = useState<FHSAWithdrawalType | ''>('');
  const [amount, setAmount] = useState('');
  const [grossAmount, setGrossAmount] = useState(0);
  const [method, setMethod] = useState<WithdrawalMethod>('eft');
  const [selectedBank, setSelectedBank] = useState<string | null>(null);
  const [allBanks, setAllBanks] = useState<LinkedBank[]>(defaultBanks);
  const [intlWire, setIntlWire] = useState<InternationalWireData>(defaultIntl);
  const [signed, setSigned] = useState(false);
  const [qualifyingEligible, setQualifyingEligible] = useState(false);
  const [qualifyingQuestionnaireComplete, setQualifyingQuestionnaireComplete] = useState(false);
  const [qualifyingData, setQualifyingData] = useState<Record<string, unknown>>({});
  /** Qualifying only: 0 = amount, 1 = RC725 eligibility (both still "Withdrawal Details" step). */
  const [fhsaQualSubStep, setFhsaQualSubStep] = useState<0 | 1>(0);
  const [submitted, setSubmitted] = useState(false);

  const [ovpExcessAmount, setOvpExcessAmount] = useState('');
  const [ovpSource, setOvpSource] = useState<'cash' | 'rrsp' | 'both' | null>(null);
  const [ovpRemovalMethod, setOvpRemovalMethod] = useState<'withdrawal' | 'transfer' | null>(null);
  const [ovpTransferAccount, setOvpTransferAccount] = useState<string | null>(null);
  const [ovpTaxUnderstood, setOvpTaxUnderstood] = useState(false);
  const [ovpAgreed, setOvpAgreed] = useState(false);
  const [ovpSigned, setOvpSigned] = useState(false);

  const bank = allBanks.find((b) => b.id === selectedBank);

  const { methodDisabled } = useLinkedBankWithdrawalRules(allBanks, selectedBank, setMethod, setIntlWire);

  const withdrawalCurrency: Currency = useMemo(() => {
    if (method === 'international_wire') return intlWire.currency;
    return getLinkedBankDepositCurrency(bank);
  }, [method, intlWire.currency, bank]);

  const withdrawalAmountStepData = useMemo(
    () => (account ? getWithdrawalAmountStepData(account, withdrawalCurrency) : null),
    [account, withdrawalCurrency],
  );

  const maxAmount = withdrawalAmountStepData?.combinedMaxInPrimary ?? 0;
  const parsedAmount = parseFloat(amount) || 0;
  const exceedsAvailable = parsedAmount > maxAmount && parsedAmount > 0;

  const isQualifying = fhsaType === 'qualifying';
  const isNonQualifying = fhsaType === 'non_qualifying';
  const isOvercontribution = fhsaType === 'overcontribution';

  const fee =
    method === 'wire' ? (withdrawalCurrency === 'USD' ? 30 : 20) : method === 'international_wire' ? 40 : 0;

  const withholdingTax =
    (isNonQualifying || (isQualifying && !qualifyingEligible)) && parsedAmount > 0
      ? calculateWithholdingTax(parsedAmount)
      : 0;
  const netAmount = parsedAmount - withholdingTax - fee;

  const ovpRemovalOptions =
    ovpSource === 'cash'
      ? [{ value: 'withdrawal' as const, label: 'Withdraw the funds as cash (Designated Withdrawal)' }]
      : ovpSource === 'rrsp'
        ? [{ value: 'transfer' as const, label: 'Transfer the funds to my RRSP or PRPP (Designated Transfer)' }]
        : ovpSource === 'both'
          ? [
              { value: 'withdrawal' as const, label: 'Withdraw the funds as cash (Designated Withdrawal)' },
              { value: 'transfer' as const, label: 'Transfer the funds to my RRSP or PRPP (Designated Transfer)' },
            ]
          : [];

  const ovpTransferReady = ovpRemovalMethod === 'transfer' ? !!ovpTransferAccount : true;

  const resetTypeSpecificFields = useCallback(() => {
    setAmount('');
    setGrossAmount(0);
    setQualifyingEligible(false);
    setQualifyingQuestionnaireComplete(false);
    setQualifyingData({});
    setFhsaQualSubStep(0);
    setOvpExcessAmount('');
    setOvpSource(null);
    setOvpRemovalMethod(null);
    setOvpTransferAccount(null);
    setOvpTaxUnderstood(false);
    setOvpAgreed(false);
    setOvpSigned(false);
  }, []);

  const handleAccountChange = useCallback(
    (acct: Account) => {
      if (acct.type !== 'FHSA') {
        if (acct.type === 'RRSP') navigate('/rrsp');
        else if (acct.type === 'RESP') navigate('/resp');
        else navigate('/');
        return;
      }
      setAccount(acct);
      setSelectedBank(null);
      setSigned(false);
      setFhsaType('');
      resetTypeSpecificFields();
      setAccountInfoSubStep(0);
      setStep(0);
    },
    [navigate, resetTypeSpecificFields],
  );

  const handleMethodChange = useCallback((m: WithdrawalMethod) => {
    setMethod(m);
    setSigned(false);
    if (m !== 'international_wire') {
      setIntlWire((d) => ({ ...d, currency: 'CAD' }));
    }
  }, []);

  const handleNonQualGrossChange = useCallback((g: number) => {
    setGrossAmount(g);
    setAmount(g > 0 ? g.toFixed(2) : '');
  }, []);

  const handleFhsaTypeChange = useCallback(
    (t: FHSAWithdrawalType) => {
      setFhsaType(t);
      resetTypeSpecificFields();
    },
    [resetTypeSpecificFields],
  );

  /** Keep excess field aligned with withdrawal amount for overcontribution demos */
  useEffect(() => {
    if (isOvercontribution && parsedAmount > 0 && !ovpExcessAmount) {
      setOvpExcessAmount(parsedAmount.toFixed(2));
    }
  }, [isOvercontribution, parsedAmount, ovpExcessAmount]);

  const step0Complete = useMemo(() => {
    if (!account || !fhsaType || !selectedBank) return false;
    if (method === 'international_wire') {
      return !!(intlWire.bankName?.trim() && intlWire.swiftCode?.trim() && signed);
    }
    return true;
  }, [account, fhsaType, method, intlWire.bankName, intlWire.swiftCode, selectedBank, signed]);

  const step1CompleteNonQual = isNonQualifying && grossAmount > 0 && !exceedsAvailable;
  const qualAmountOk = parsedAmount > 0 && !exceedsAvailable;
  const step1CompleteQual =
    isQualifying && qualAmountOk && (qualifyingEligible || qualifyingQuestionnaireComplete);
  const step1CompleteOvp =
    isOvercontribution &&
    parsedAmount > 0 &&
    !exceedsAvailable &&
    !!ovpExcessAmount &&
    parseFloat(stripFormatting(ovpExcessAmount)) > 0 &&
    !!ovpSource &&
    !!ovpRemovalMethod &&
    ovpTransferReady &&
    ovpTaxUnderstood &&
    ovpAgreed &&
    ovpSigned;

  const step1Complete = step1CompleteNonQual || step1CompleteQual || step1CompleteOvp;

  const typeLabel = isQualifying ? 'Qualifying (Home Purchase)' : isNonQualifying ? 'Non-Qualifying' : 'Overcontribution';

  const methodSummaryLabel = withdrawalMethodSummaryLabel(method);
  const methodEta = withdrawalMethodEtaSummary(method);

  const renderReviewSummary = useCallback(() => {
    if (!account) return null;
    return (
      <>
        {isQualifying && !!qualifyingData.street && (
          <>
            <SummaryRow label="Account holder" value="Anastasia Carmichael" />
            <SummaryRow
              label="Property address"
              value={`${String(qualifyingData.street)}, ${String(qualifyingData.city)}, ${String(qualifyingData.province)} ${String(qualifyingData.postalCode)}`}
            />
          </>
        )}
        <SummaryRow label="Account" value={`${account.label} - ${account.accountNumber}`} />
        <SummaryRow label="Withdrawal type" value={typeLabel} />
        <SummaryRow label="Currency" value={withdrawalCurrency} />
        <SummaryRow label="Withdrawal amount" value={formatCurrency(parsedAmount, withdrawalCurrency)} />
        {(isNonQualifying || (isQualifying && !qualifyingEligible)) && withholdingTax > 0 && (
          <SummaryRow label="Withholding tax" value={`-${formatCurrency(withholdingTax, withdrawalCurrency)}`} />
        )}
        {isQualifying && qualifyingEligible && (
          <SummaryRow label="Withholding tax" value="$0.00 (Tax-free)" />
        )}
        <SummaryRow label="Method" value={methodSummaryLabel} />
        {methodEta ? <SummaryRow label="ETA" value={methodEta} /> : null}
        {fee > 0 && <SummaryRow label="Fee" value={`-${formatCurrency(fee, withdrawalCurrency)}`} />}
        {bank && (
          <SummaryRow label="Deposit bank" value={`${bank.name} · ****${bank.last4} (${getLinkedBankDepositCurrency(bank)})`} />
        )}
        {method === 'international_wire' && (
          <>
            <SummaryRow label="Wire currency" value={intlWire.currency} />
            <SummaryRow label="Receiving bank" value={intlWire.bankName} />
            {intlWire.bankCity?.trim() ? <SummaryRow label="City" value={intlWire.bankCity} /> : null}
            {intlWire.bankCountry?.trim() ? <SummaryRow label="Country" value={intlWire.bankCountry} /> : null}
            <SummaryRow label="SWIFT / BIC" value={intlWire.swiftCode} />
            {intlWire.bankAccountNumber?.trim() ? (
              <SummaryRow label="Account / IBAN" value={intlWire.bankAccountNumber} />
            ) : null}
            {intlWire.routingNumber?.trim() ? <SummaryRow label="Routing number" value={intlWire.routingNumber} /> : null}
            {intlWire.hasIntermediary ? (
              <SummaryRow
                label="Intermediary bank"
                value={
                  [intlWire.intermediaryBankName, intlWire.intermediarySwiftCode].filter(Boolean).join(' · ') || 'Yes'
                }
              />
            ) : null}
            {intlWire.isBrokerage ? (
              <SummaryRow label="Brokerage" value={intlWire.brokerageName || 'Yes'} />
            ) : null}
          </>
        )}
        <div className="flex items-center justify-between gap-2 bg-qt-bg-3 px-3 py-3">
          <p className="text-xs font-semibold text-qt-primary">Withdrawal amount requested</p>
          <p className="text-sm font-semibold text-qt-green-dark tabular-nums">
            {formatCurrency(Math.max(0, netAmount), withdrawalCurrency)}
          </p>
        </div>
        {isQualifying && (
          <div className="px-3 py-2">
            <button
              type="button"
              className="flex items-center gap-2 text-xs font-semibold text-qt-green-dark"
              onClick={() => {
                const blob = new Blob(['RC725 — demo'], { type: 'application/pdf' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'RC725-prefilled.pdf';
                a.click();
                URL.revokeObjectURL(url);
              }}
            >
              <Download size={14} /> Download pre-filled RC725
            </button>
          </div>
        )}
        {isOvercontribution && (
          <div className="space-y-2 px-3 py-2">
            <SummaryRow
              label="Excess amount"
              value={ovpExcessAmount ? formatCurrency(parseFloat(stripFormatting(ovpExcessAmount)) || 0, withdrawalCurrency) : ''}
            />
            <button
              type="button"
              className="flex items-center gap-2 text-xs font-semibold text-qt-green-dark"
              onClick={() => {
                const blob = new Blob(['RC727 — demo'], { type: 'application/pdf' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'RC727-prefilled.pdf';
                a.click();
                URL.revokeObjectURL(url);
              }}
            >
              <Download size={14} /> Download pre-filled RC727
            </button>
          </div>
        )}
      </>
    );
  }, [
    account,
    bank,
    fee,
    intlWire,
    isNonQualifying,
    isOvercontribution,
    isQualifying,
    qualifyingEligible,
    method,
    methodEta,
    methodSummaryLabel,
    netAmount,
    ovpExcessAmount,
    parsedAmount,
    qualifyingData.city,
    qualifyingData.postalCode,
    qualifyingData.province,
    qualifyingData.street,
    typeLabel,
    withholdingTax,
    withdrawalCurrency,
  ]);

  const handlePrimary = useCallback(() => {
    if (step === 0 && accountInfoSubStep === 0) {
      if (account?.type === 'FHSA') setAccountInfoSubStep(1);
      return;
    }
    if (step === 0 && accountInfoSubStep === 1 && step0Complete) {
      if (isQualifying) setFhsaQualSubStep(0);
      setStep(1);
      return;
    }
    if (step === 1 && isQualifying) {
      if (fhsaQualSubStep === 0 && qualAmountOk) {
        setFhsaQualSubStep(1);
        return;
      }
      if (fhsaQualSubStep === 1 && step1CompleteQual) {
        setAmount(parsedAmount > 0 ? parsedAmount.toFixed(2) : '');
        setStep(2);
        return;
      }
      return;
    }
    if (step === 1 && step1Complete) {
      setAmount(parsedAmount > 0 ? parsedAmount.toFixed(2) : '');
      setStep(2);
      return;
    }
    if (step === 2) {
      setSubmitted(true);
    }
  }, [
    step,
    accountInfoSubStep,
    step0Complete,
    step1Complete,
    isQualifying,
    fhsaQualSubStep,
    qualAmountOk,
    qualifyingQuestionnaireComplete,
    step1CompleteQual,
    parsedAmount,
    account,
  ]);

  const primaryLabel = step === 2 ? 'Submit' : 'Next';
  const primaryDisabled =
    step === 0 && accountInfoSubStep === 0
      ? !account || account.type !== 'FHSA'
      : step === 0 && accountInfoSubStep === 1
        ? !step0Complete
        : step === 1
        ? isQualifying
          ? fhsaQualSubStep === 0
            ? !qualAmountOk
            : !(qualAmountOk && (qualifyingEligible || qualifyingQuestionnaireComplete))
          : !step1Complete
        : step === 2
          ? !account || netAmount < 0
          : true;

  const goBack = useCallback(() => {
    if (step === 2) {
      setStep(1);
      if (isQualifying) {
        setFhsaQualSubStep(qualAmountOk ? 1 : 0);
      }
      return;
    }
    if (step === 1 && isQualifying && fhsaQualSubStep === 1) {
      setFhsaQualSubStep(0);
      return;
    }
    if (step === 1) {
      setStep(0);
      setAccountInfoSubStep(1);
      return;
    }
    if (step === 0 && accountInfoSubStep === 1) {
      setAccountInfoSubStep(0);
      return;
    }
    if (step === 0 && accountInfoSubStep === 0) {
      navigate('/');
      return;
    }
  }, [step, isQualifying, fhsaQualSubStep, qualAmountOk, accountInfoSubStep, navigate]);

  if (submitted && account) {
    return (
      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-4 py-6">
        <p className="text-center text-xs font-semibold text-qt-secondary">Complete</p>
        <div className="mx-auto mb-4 mt-2 flex size-20 items-center justify-center rounded-full bg-qt-green-bg">
          <CheckCircle2 size={40} className="text-qt-green" />
        </div>
        <h2 className="mb-3 text-center text-xl font-semibold text-qt-primary">Withdrawal submitted</h2>
        <div className="mb-6 divide-y divide-figma-neutral-100 rounded-lg border border-figma-neutral-100 bg-figma-neutral-00">
          {renderReviewSummary()}
        </div>
        <p className="mb-2 text-center text-sm text-qt-secondary">
          Your {typeLabel} withdrawal request has been submitted.
        </p>
        <p className="mb-8 text-center text-xs text-qt-secondary">
          Processing typically takes 1–3 business days. You&apos;ll receive a confirmation email shortly.
        </p>
        <div className="flex justify-center px-[length:var(--ads-size-xxs)]">
          <MobileButton
            fullWidth
            className="!h-[length:var(--ads-size-xl)] !min-h-[length:var(--ads-size-xl)] !gap-[length:var(--ads-size-nano)] !rounded-[length:var(--ads-border-radius-xl)] !bg-[var(--ads-color-primary-500)] !px-[length:var(--ads-size-s)] !py-[length:var(--ads-size-quark)] !text-base text-white active:opacity-90"
            onClick={() => {
              setSubmitted(false);
              setAccount(null);
              setAccountInfoSubStep(0);
              setFhsaType('');
              setSelectedBank(null);
              setMethod('eft');
              setSigned(false);
              setIntlWire(defaultIntl);
              resetTypeSpecificFields();
              setStep(0);
            }}
          >
            Start new withdrawal
          </MobileButton>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 w-full flex-1 flex-col overflow-hidden">
      <div className="relative shrink-0">
        {(step > 0 || (step === 0 && accountInfoSubStep === 1)) && (
          <button
            type="button"
            onClick={goBack}
            className="absolute left-[length:var(--ads-size-xxs)] top-3 z-10 flex size-9 items-center justify-center rounded-full text-[var(--ads-color-body-contrast-100)] active:bg-qt-bg-3 cursor-pointer"
            aria-label="Back"
          >
            <ChevronLeft className="size-[18px]" strokeWidth={2.25} aria-hidden />
          </button>
        )}
        <div className="flex flex-col items-start gap-[length:var(--ads-size-xxxs)] self-stretch px-[length:var(--ads-size-xxs)] pb-2 pt-2">
          <h1
            className={
              step === 0 && accountInfoSubStep === 0
                ? 'w-full text-center font-[family-name:var(--ads-font-family-body)] text-xl font-semibold leading-7 text-[var(--ads-color-body-contrast-100)]'
                : 'w-full text-center font-[family-name:var(--ads-font-family-body)] text-[length:var(--ads-font-size-s)] font-semibold leading-[length:var(--ads-font-line-height-s)] text-[var(--ads-color-body-contrast-100)]'
            }
          >
            {step === 0 && accountInfoSubStep === 0 ? 'Choose an account' : STEP_TITLES[step]}
          </h1>
          {!(step === 0 && accountInfoSubStep === 0) && <MobileThreeStepProgress step={step} />}
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-y-contain [overflow-anchor:none] px-[length:var(--ads-size-xxs)] pt-2 pb-4">
        {step === 0 && accountInfoSubStep === 0 && (
          <div className="mx-auto flex w-full max-w-[357px] flex-col gap-4 pb-2">
            <h2 className="w-full text-left font-[family-name:var(--ads-font-family-body)] text-lg font-semibold leading-[26px] text-[var(--ads-color-body-contrast-100)]">
              Choose an account to withdraw from
            </h2>
            <MobileAccountSelectionList
              accounts={accounts}
              value={account?.id ?? null}
              onSelect={handleAccountChange}
            />
          </div>
        )}

        {step === 0 && accountInfoSubStep === 1 && account && (
          <div className="flex flex-col gap-3">
            <p className="text-[11px] font-medium text-qt-primary">Tell us where to send your funds.</p>
            <MobileBankDepositDropdown
              value={selectedBank}
              onChange={setSelectedBank}
              allBanks={allBanks}
              onBanksChange={setAllBanks}
            />
            <MobileWithdrawalMethodDropdown
              value={method}
              onChange={handleMethodChange}
              currencyHint={withdrawalCurrency}
              methodDisabled={methodDisabled}
            />
            <MobileWithdrawalTypeDropdown<FHSAWithdrawalType>
              label="Withdrawal type"
              options={FHSA_TYPE_OPTIONS}
              value={fhsaType}
              onChange={handleFhsaTypeChange}
            />
            {method === 'international_wire' && (
              <MobileInternationalWireForm
                currency={withdrawalCurrency}
                amount={amount}
                data={intlWire}
                onChange={setIntlWire}
                signed={signed}
                onSign={() => setSigned(true)}
              />
            )}
          </div>
        )}

        {step === 1 && account && withdrawalAmountStepData && fhsaType && (
          <div className="flex flex-col items-center gap-4">
            {isNonQualifying && (
              <div className="flex w-full max-w-[357px] flex-col gap-4">
                <MobileWithdrawAvailableSummary
                  primaryCurrency={withdrawalAmountStepData.primaryCurrency}
                  availableBalance={withdrawalAmountStepData.availableBalance}
                  unavailableBalance={withdrawalAmountStepData.unavailableBalance}
                  secondaryCurrency={withdrawalAmountStepData.secondaryCurrency}
                  secondaryBalance={withdrawalAmountStepData.secondaryBalance}
                  maxFromSecondaryInPrimary={withdrawalAmountStepData.maxFromSecondaryInPrimary}
                  combinedMaxInPrimary={withdrawalAmountStepData.combinedMaxInPrimary}
                />
                <RRSPCalculator compact currency={withdrawalCurrency} onAmountChange={handleNonQualGrossChange} />
                {grossAmount > 0 && (
                  <div className="rounded-lg bg-qt-bg-3 px-3 py-2">
                    <p className="text-[10px] text-qt-secondary">Withdrawal amount (gross)</p>
                    <p className="text-sm font-semibold text-qt-primary tabular-nums">
                      {formatCurrency(grossAmount, withdrawalCurrency)}
                    </p>
                    {exceedsAvailable && (
                      <p className="mt-1 text-xs font-semibold text-qt-red">
                        Exceeds available ({formatCurrency(maxAmount, withdrawalCurrency)})
                      </p>
                    )}
                  </div>
                )}
                {grossAmount > withdrawalAmountStepData.availableBalance && grossAmount > 0 && (
                  <div
                    className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-3 text-[11px] leading-relaxed text-amber-950"
                    role="status"
                  >
                    Your request exceeds your {withdrawalAmountStepData.primaryCurrency} balance. An automatic
                    currency conversion will be applied to cover the difference.
                  </div>
                )}
              </div>
            )}

            {isQualifying && (
              <div className="flex w-full max-w-[357px] flex-col gap-4">
                {fhsaQualSubStep === 0 && (
                  <MobileWithdrawalAmountStep
                    primaryCurrency={withdrawalAmountStepData.primaryCurrency}
                    availableBalance={withdrawalAmountStepData.availableBalance}
                    unavailableBalance={withdrawalAmountStepData.unavailableBalance}
                    secondaryCurrency={withdrawalAmountStepData.secondaryCurrency}
                    secondaryBalance={withdrawalAmountStepData.secondaryBalance}
                    maxFromSecondaryInPrimary={withdrawalAmountStepData.maxFromSecondaryInPrimary}
                    combinedMaxInPrimary={withdrawalAmountStepData.combinedMaxInPrimary}
                    amount={amount}
                    onAmountChange={setAmount}
                  />
                )}
                {fhsaQualSubStep === 1 && (
                  <div className="w-full space-y-2">
                    <div>
                      <p className="text-xs font-semibold text-qt-primary">RC725 — Qualifying withdrawal</p>
                      <p className="text-[11px] text-qt-secondary leading-snug">
                        Complete the questionnaire. A pre-filled RC725 is available on the review step.
                      </p>
                    </div>
                    <FHSAEligibility
                      onComplete={(elig, data) => {
                        setQualifyingEligible(elig);
                        setQualifyingData(data as unknown as Record<string, unknown>);
                      }}
                      onQuestionnaireComplete={setQualifyingQuestionnaireComplete}
                      withdrawalAmount={amount}
                      onWithdrawalAmountChange={setAmount}
                    />
                  </div>
                )}
              </div>
            )}

            {isOvercontribution && (
              <div className="flex w-full max-w-[357px] flex-col gap-4">
                <MobileWithdrawalAmountStep
                  primaryCurrency={withdrawalAmountStepData.primaryCurrency}
                  availableBalance={withdrawalAmountStepData.availableBalance}
                  unavailableBalance={withdrawalAmountStepData.unavailableBalance}
                  secondaryCurrency={withdrawalAmountStepData.secondaryCurrency}
                  secondaryBalance={withdrawalAmountStepData.secondaryBalance}
                  maxFromSecondaryInPrimary={withdrawalAmountStepData.maxFromSecondaryInPrimary}
                  combinedMaxInPrimary={withdrawalAmountStepData.combinedMaxInPrimary}
                  amount={amount}
                  onAmountChange={setAmount}
                />
                <div className="space-y-3 border-t border-figma-neutral-100 pt-4">
                  <div>
                    <p className="text-xs font-semibold text-qt-primary">RC727 — Excess FHSA</p>
                    <p className="text-[11px] text-qt-secondary leading-snug">
                      Answer the following questions. A pre-filled RC727 is available on review.
                    </p>
                  </div>
                  <div className="rounded-lg bg-qt-bg-3 p-3">
                    <p className="mb-1 text-[10px] font-bold uppercase tracking-wide text-qt-secondary">Taxpayer</p>
                    <div className="flex flex-col gap-1 text-[11px] text-qt-primary">
                      <div>
                        <span className="text-qt-secondary">Name:</span> Anastasia Carmichael
                      </div>
                      <div>
                        <span className="text-qt-secondary">SIN:</span> •••-•••-123
                      </div>
                      <div>
                        <span className="text-qt-secondary">Address:</span> 42 Queen St W, Toronto ON
                      </div>
                      <div>
                        <span className="text-qt-secondary">Phone:</span> (416) 555-0199
                      </div>
                    </div>
                  </div>
                  <div>
                    <p className="mb-2 text-sm font-semibold text-qt-primary">
                      How much is your excess FHSA amount (the amount you overcontributed)?
                    </p>
                    <MobileCurrencyInput
                      label="Excess amount"
                      value={ovpExcessAmount}
                      onChange={setOvpExcessAmount}
                      max={maxAmount}
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <p className="text-sm font-semibold text-qt-primary">How did the excess money originally get into your FHSA?</p>
                    <MobileRadioOption
                      name="ovpSource"
                      value="cash"
                      label="I deposited cash directly from my bank account"
                      checked={ovpSource === 'cash'}
                      onChange={() => {
                        setOvpSource('cash');
                        setOvpRemovalMethod(null);
                        setOvpTransferAccount(null);
                      }}
                    />
                    <MobileRadioOption
                      name="ovpSource"
                      value="rrsp"
                      label="I transferred the money in from my RRSP"
                      checked={ovpSource === 'rrsp'}
                      onChange={() => {
                        setOvpSource('rrsp');
                        setOvpRemovalMethod(null);
                        setOvpTransferAccount(null);
                      }}
                    />
                    <MobileRadioOption
                      name="ovpSource"
                      value="both"
                      label="A mix of both cash deposits and RRSP transfers"
                      checked={ovpSource === 'both'}
                      onChange={() => {
                        setOvpSource('both');
                        setOvpRemovalMethod(null);
                        setOvpTransferAccount(null);
                      }}
                    />
                  </div>
                  {!!ovpSource && (
                    <div className="flex flex-col gap-2">
                      <p className="text-sm font-semibold text-qt-primary">How would you like to remove these excess funds today?</p>
                      {ovpRemovalOptions.map((opt) => (
                        <MobileRadioOption
                          key={opt.value}
                          name="ovpRemoval"
                          value={opt.value}
                          label={opt.label}
                          checked={ovpRemovalMethod === opt.value}
                          onChange={() => {
                            setOvpRemovalMethod(opt.value);
                            setOvpTransferAccount(null);
                          }}
                        />
                      ))}
                    </div>
                  )}
                  {ovpRemovalMethod === 'transfer' && (
                    <MobileOptionCards<string>
                      label="Which retirement account would you like to transfer the funds into?"
                      options={rrspAccounts.map((a) => ({
                        value: a.id,
                        label: `${a.label} - ${a.accountNumber}`,
                      }))}
                      value={ovpTransferAccount}
                      onChange={(id) => setOvpTransferAccount(id)}
                    />
                  )}
                  {!!ovpRemovalMethod && ovpTransferReady && (
                    <div className="flex flex-col gap-2">
                      <MobileInfoBox variant="warning">
                        <div className="flex flex-col gap-0.5">
                          <p className="text-[11px] font-semibold">Tax reminder</p>
                          <p className="text-[11px] leading-snug">
                            You must still file <strong>RC728</strong> for penalty months.
                          </p>
                        </div>
                      </MobileInfoBox>
                      <label className="flex cursor-pointer items-start gap-2">
                        <input
                          type="checkbox"
                          checked={ovpTaxUnderstood}
                          onChange={(e) => setOvpTaxUnderstood(e.target.checked)}
                          className="mt-0.5 size-4 shrink-0 cursor-pointer accent-qt-green"
                        />
                        <span className="text-xs text-qt-primary">I understand</span>
                      </label>
                    </div>
                  )}
                  {ovpTaxUnderstood && (
                    <MobileESignature onSign={() => setOvpSigned(true)} signed={ovpSigned} />
                  )}
                  {ovpSigned && (
                    <div className="rounded-lg border-2 border-qt-border bg-qt-bg-3 p-3">
                      <p className="mb-2 text-[11px] leading-snug text-qt-primary">
                        I certify the information is correct and authorize removal of my excess FHSA amount.
                      </p>
                      <label className="flex cursor-pointer items-start gap-2">
                        <input
                          type="checkbox"
                          checked={ovpAgreed}
                          onChange={(e) => setOvpAgreed(e.target.checked)}
                          className="mt-0.5 size-4 shrink-0 cursor-pointer accent-qt-green"
                        />
                        <span className="text-xs font-semibold text-qt-primary">I agree</span>
                      </label>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {step === 2 && account && (
          <div className="flex flex-col gap-2">
            <p className="text-sm text-qt-secondary">Check the details below before submitting.</p>
            <div className="divide-y divide-figma-neutral-100 overflow-hidden rounded-xl border border-figma-neutral-100 bg-figma-neutral-00">
              {renderReviewSummary()}
            </div>
          </div>
        )}
      </div>

      <div className="shrink-0 px-[length:var(--ads-size-xxs)] pt-2 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <div className="mx-auto flex w-full max-w-[357px] flex-col">
          <MobileButton
            onClick={handlePrimary}
            disabled={primaryDisabled}
            fullWidth
            className="!h-[length:var(--ads-size-xl)] !min-h-[length:var(--ads-size-xl)] !gap-[length:var(--ads-size-nano)] !rounded-[length:var(--ads-border-radius-xl)] !bg-[var(--ads-color-primary-500)] !px-[length:var(--ads-size-s)] !py-[length:var(--ads-size-quark)] !text-base text-white active:opacity-90"
          >
            {primaryLabel}
          </MobileButton>
        </div>
      </div>
    </div>
  );
}
