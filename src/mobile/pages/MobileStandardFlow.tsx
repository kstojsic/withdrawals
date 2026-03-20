import { useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, ChevronLeft } from 'lucide-react';
import MobileButton from '../components/MobileButton';
import MobileAccountDropdown from '../components/MobileAccountDropdown';
import MobileBankDepositDropdown from '../components/MobileBankDepositDropdown';
import MobileWithdrawalMethodDropdown from '../components/MobileWithdrawalMethodDropdown';
import MobileThreeStepProgress from '../components/MobileThreeStepProgress';
import MobileWithdrawalAmountStep from '../components/MobileWithdrawalAmountStep';
import MobileInputField from '../components/MobileInputField';
import MobileESignature from '../components/MobileESignature';
import {
  accounts,
  linkedBanks as defaultBanks,
  formatCurrency,
  getLinkedBankDepositCurrency,
  getWithdrawalAmountStepData,
} from '../../data/accounts';
import type { Account, Currency, WithdrawalMethod, LinkedBank, InternationalWireData } from '../../types';

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-2 px-3 py-2.5">
      <p className="text-xs text-qt-secondary shrink-0">{label}</p>
      <p className="text-xs font-semibold text-qt-primary text-right max-w-[58%] break-words">{value}</p>
    </div>
  );
}

const STEP_TITLES = ['Account information', 'Withdrawal Details', 'Review and Confirm'] as const;

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

export default function MobileStandardFlow() {
  const navigate = useNavigate();
  const [step, setStep] = useState<0 | 1 | 2>(0);
  const [account, setAccount] = useState<Account | null>(null);
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState<WithdrawalMethod>('eft');
  const [selectedBank, setSelectedBank] = useState<string | null>(null);
  const [allBanks, setAllBanks] = useState<LinkedBank[]>(defaultBanks);
  const [intlWire, setIntlWire] = useState<InternationalWireData>(defaultIntl);
  const [signed, setSigned] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const bank = allBanks.find((b) => b.id === selectedBank);

  const withdrawalCurrency: Currency = useMemo(() => {
    if (method === 'international_wire') return intlWire.currency;
    return getLinkedBankDepositCurrency(bank);
  }, [method, intlWire.currency, bank]);

  const handleAccountChange = useCallback(
    (acct: Account) => {
      if (acct.type === 'RRSP') {
        navigate('/rrsp');
        return;
      }
      if (acct.type === 'FHSA') {
        navigate('/fhsa');
        return;
      }
      if (acct.type === 'RESP') {
        navigate('/resp');
        return;
      }
      setAccount(acct);
      setAmount('');
      setSelectedBank(null);
      setSigned(false);
      setStep(0);
    },
    [navigate],
  );

  const parsedAmount = parseFloat(amount) || 0;

  const withdrawalAmountStepData = useMemo(
    () => (account ? getWithdrawalAmountStepData(account, withdrawalCurrency) : null),
    [account, withdrawalCurrency],
  );
  const fee =
    method === 'wire' ? (withdrawalCurrency === 'USD' ? 30 : 20) : method === 'international_wire' ? 40 : 0;
  const netAmount = parsedAmount - fee;

  const step0Complete = useMemo(() => {
    if (!account) return false;
    if (method === 'international_wire') {
      return !!(intlWire.bankName?.trim() && intlWire.swiftCode?.trim() && signed);
    }
    return !!selectedBank;
  }, [account, method, intlWire.bankName, intlWire.swiftCode, selectedBank, signed]);

  const renderReviewSummary = useCallback(() => {
    if (!account) return null;
    return (
      <>
        <SummaryRow label="Account" value={`${account.label} - ${account.accountNumber}`} />
        {method !== 'international_wire' && bank && (
          <SummaryRow label="Deposit bank" value={`${bank.name} · ****${bank.last4} (${getLinkedBankDepositCurrency(bank)})`} />
        )}
        <SummaryRow label="Currency" value={withdrawalCurrency} />
        <SummaryRow label="Withdrawal amount" value={formatCurrency(parsedAmount, withdrawalCurrency)} />
        <SummaryRow
          label="Method"
          value={method === 'eft' ? 'EFT' : method === 'wire' ? 'Wire transfer' : 'International wire'}
        />
        {fee > 0 && <SummaryRow label="Fee" value={`-${formatCurrency(fee, withdrawalCurrency)}`} />}
        {method === 'international_wire' && (
          <>
            <SummaryRow label="Receiving bank" value={intlWire.bankName} />
            <SummaryRow label="SWIFT / BIC" value={intlWire.swiftCode} />
          </>
        )}
        <div className="flex items-center justify-between gap-2 bg-qt-bg-3 px-3 py-3">
          <p className="text-xs font-semibold text-qt-primary">Net to you</p>
          <p className="text-sm font-semibold text-qt-green-dark tabular-nums">
            {formatCurrency(Math.max(0, netAmount), withdrawalCurrency)}
          </p>
        </div>
      </>
    );
  }, [account, bank, fee, intlWire.bankName, intlWire.swiftCode, method, netAmount, parsedAmount, withdrawalCurrency]);

  const handleMethodChange = useCallback((m: WithdrawalMethod) => {
    setMethod(m);
    setSigned(false);
    if (m !== 'international_wire') {
      setIntlWire((d) => ({ ...d, currency: 'CAD' }));
    }
  }, []);

  const handlePrimary = useCallback(() => {
    if (step === 0 && step0Complete) {
      setStep(1);
      return;
    }
    if (step === 1) {
      return;
    }
    if (step === 2) {
      setSubmitted(true);
    }
  }, [step, step0Complete]);

  const primaryLabel = 'Next';
  const primaryDisabled =
    step === 0 ? !step0Complete : step === 2 ? !account || netAmount < 0 : true;

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
          Your withdrawal request of{' '}
          <strong className="text-qt-primary">{formatCurrency(parsedAmount, withdrawalCurrency)}</strong> from{' '}
          <strong className="text-qt-primary">{account.label}</strong> has been submitted.
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
              setAmount('');
              setMethod('eft');
              setSelectedBank(null);
              setSigned(false);
              setIntlWire(defaultIntl);
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
      {/* ADS: progress block — flex column, padding 0 var(--ads-size-xxs), gap var(--ads-size-xxxs), align-items flex-start, align-self stretch */}
      <div className="relative shrink-0">
        {step > 0 && (
          <button
            type="button"
            onClick={() => setStep((s) => (s === 2 ? 1 : 0))}
            className="absolute left-[length:var(--ads-size-xxs)] top-3 z-10 flex size-9 items-center justify-center rounded-full text-[var(--ads-color-body-contrast-100)] active:bg-qt-bg-3 cursor-pointer"
            aria-label="Back"
          >
            <ChevronLeft className="size-[18px]" strokeWidth={2.25} aria-hidden />
          </button>
        )}
        <div className="flex flex-col items-start gap-[length:var(--ads-size-xxxs)] self-stretch px-[length:var(--ads-size-xxs)] pb-2 pt-2">
          {/* body/additional/medium-semibold */}
          <h1 className="w-full text-center font-[family-name:var(--ads-font-family-body)] text-[length:var(--ads-font-size-s)] font-semibold leading-[length:var(--ads-font-line-height-s)] text-[var(--ads-color-body-contrast-100)]">
            {STEP_TITLES[step]}
          </h1>
          <MobileThreeStepProgress step={step} />
        </div>
      </div>

      <div
        className={`min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-[length:var(--ads-size-xxs)] pt-2 ${
          step === 1 ? 'pb-[max(1.25rem,env(safe-area-inset-bottom))]' : 'pb-4'
        }`}
      >
        {step === 0 && (
          <div className="flex flex-col gap-3">
            <p className="text-[11px] font-medium text-qt-primary">Tell us where to send your funds.</p>
            <MobileAccountDropdown accounts={accounts} value={account?.id ?? null} onChange={handleAccountChange} />
            {account && (
              <>
                {method !== 'international_wire' ? (
                  <MobileBankDepositDropdown
                    value={selectedBank}
                    onChange={setSelectedBank}
                    allBanks={allBanks}
                    onBanksChange={setAllBanks}
                  />
                ) : (
                  <p className="rounded-lg bg-qt-bg-3 px-3 py-2 text-[11px] text-qt-secondary">
                    International wires go to the bank you specify below — no Canadian deposit account needed.
                  </p>
                )}
                <MobileWithdrawalMethodDropdown
                  value={method}
                  onChange={handleMethodChange}
                  currencyHint={withdrawalCurrency}
                />
                {method === 'international_wire' && (
                  <div className="flex flex-col gap-3 rounded-xl border border-figma-neutral-100 bg-figma-neutral-00 p-3">
                    <p className="text-xs font-semibold text-qt-primary">Wire currency</p>
                    <div className="grid grid-cols-2 gap-2">
                      {(['CAD', 'USD'] as const).map((c) => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => setIntlWire((d) => ({ ...d, currency: c }))}
                          className={`min-h-[40px] rounded-lg border-2 text-sm font-bold ${
                            intlWire.currency === c
                              ? 'border-qt-green bg-qt-green-bg/30'
                              : 'border-figma-neutral-100 bg-figma-neutral-00'
                          }`}
                        >
                          {c}
                        </button>
                      ))}
                    </div>
                    <MobileInputField
                      label="Receiving bank name"
                      placeholder="Bank name"
                      value={intlWire.bankName}
                      onChange={(e) => setIntlWire((d) => ({ ...d, bankName: e.target.value }))}
                    />
                    <MobileInputField
                      label="SWIFT / BIC code"
                      placeholder="e.g. BOFAUS3N"
                      value={intlWire.swiftCode}
                      onChange={(e) => setIntlWire((d) => ({ ...d, swiftCode: e.target.value }))}
                    />
                    <MobileESignature onSign={() => setSigned(true)} signed={signed} />
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {step === 1 && account && withdrawalAmountStepData && (
          <div className="flex flex-col items-center">
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
              onContinue={(entered) => {
                setAmount(entered > 0 ? entered.toFixed(2) : '');
                setStep(2);
              }}
            />
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

      {/* Step 1 uses in-flow Continue; other steps pin primary CTA here */}
      {step !== 1 && (
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
      )}
    </div>
  );
}
