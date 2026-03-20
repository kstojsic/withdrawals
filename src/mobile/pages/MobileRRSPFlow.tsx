import { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, Download } from 'lucide-react';
import WizardShell from '../components/WizardShell';
import MobileButton from '../components/MobileButton';
import { useWizardNavigation } from '../wizard/useWizardNavigation';
import { buildRrspWizardSteps, getRrspWizardShellProgress, type RrspWizardCtx } from '../wizard/rrspWizard';
import { accounts, linkedBanks as defaultBanks, formatCurrency, FX_RATE, FX_BUFFER } from '../../data/accounts';
import type { Account, Currency, WithdrawalMethod, LinkedBank, InternationalWireData, RRSPWithdrawalType } from '../../types';

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between px-3 py-2 gap-2">
      <p className="text-xs text-qt-secondary shrink-0">{label}</p>
      <p className="text-xs font-semibold text-qt-primary text-right max-w-[58%] break-words">{value}</p>
    </div>
  );
}

export default function MobileRRSPFlow() {
  const navigate = useNavigate();
  const [account, setAccount] = useState<Account | null>(() => accounts.find((a) => a.type === 'RRSP') ?? null);

  const [rrspType, setRrspType] = useState<RRSPWithdrawalType | ''>('');
  const [currency, setCurrency] = useState<Currency | null>(null);
  const [grossAmount, setGrossAmount] = useState(0);
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState<WithdrawalMethod | null>(null);
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
  const [llpEligible, setLlpEligible] = useState(false);
  const [llpData, setLlpData] = useState<Record<string, unknown>>({});
  const [address, setAddress] = useState({ street: '', city: '', province: '', postalCode: '' });
  const [confirmChecked, setConfirmChecked] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [depositBankFromNewLink, setDepositBankFromNewLink] = useState(false);

  const wizardSteps = useMemo(() => buildRrspWizardSteps(), []);

  const showWithdrawalCurrency = !selectedBank || depositBankFromNewLink;

  const onDepositBankSelectionKind = useCallback((kind: 'existing' | 'newly_linked') => {
    if (kind === 'existing') {
      setDepositBankFromNewLink(false);
      setCurrency('CAD');
      setAmount('');
      setGrossAmount(0);
    } else {
      setDepositBankFromNewLink(true);
      setCurrency(null);
      setAmount('');
      setGrossAmount(0);
    }
  }, []);

  const resetForm = useCallback(() => {
    setRrspType('');
    setCurrency(null);
    setAmount('');
    setMethod(null);
    setSelectedBank(null);
    setDepositBankFromNewLink(false);
    setGrossAmount(0);
    setHbpEligible(null);
    setLlpEligible(false);
    setLlpData({});
    setSigned(false);
    setConfirmChecked(false);
    setAddress({ street: '', city: '', province: '', postalCode: '' });
  }, []);

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
      resetForm();
    },
    [navigate, resetForm],
  );

  const cadAvailable = account ? account.balance.cad : 0;
  const usdAvailable = account ? account.balance.usd : 0;
  const combinedCad = cadAvailable + usdAvailable * FX_RATE * (1 - FX_BUFFER);
  const combinedUsd = cadAvailable / FX_RATE * (1 - FX_BUFFER) + usdAvailable;
  const maxAmount = currency === 'CAD' ? combinedCad : currency === 'USD' ? combinedUsd : 0;
  const parsedAmount = parseFloat(amount) || 0;
  const exceedsAvailable = parsedAmount > maxAmount && parsedAmount > 0;
  const singleCurrencyBalance = currency === 'CAD' ? cadAvailable : currency === 'USD' ? usdAvailable : 0;
  const triggersConversion = parsedAmount > singleCurrencyBalance && !exceedsAvailable && parsedAmount > 0;
  const fee = method === 'wire' ? (currency === 'USD' ? 30 : 20) : method === 'international_wire' ? 40 : 0;

  const isDeregistration = rrspType === 'deregistration';
  const isHBP = rrspType === 'hbp';
  const isLLP = rrspType === 'llp';
  const isOvercontribution = rrspType === 'overcontribution';

  const hbpMax = currency === 'USD' ? 60000 / FX_RATE : 60000;
  const llpYearlyMax = currency === 'USD' ? 10000 / FX_RATE : 10000;
  const llpLifetimeMax = currency === 'USD' ? 20000 / FX_RATE : 20000;

  const bankReady =
    method === 'international_wire'
      ? !!(intlWire.bankName && intlWire.swiftCode)
      : !!selectedBank;

  const withholdingTax = isDeregistration
    ? parsedAmount <= 5000
      ? parsedAmount * 0.1
      : parsedAmount <= 15000
        ? parsedAmount * 0.2
        : parsedAmount * 0.3
    : 0;
  const net = parsedAmount - withholdingTax - fee;

  const canContinueDeregistration =
    !!currency && parsedAmount > 0 && !exceedsAvailable && !!method && !!bankReady;
  const canContinueHBP =
    !!currency &&
    parsedAmount > 0 &&
    !exceedsAvailable &&
    !!method &&
    !!bankReady &&
    confirmChecked &&
    hbpEligible === true &&
    !!address.street &&
    !!address.city &&
    (method === 'international_wire' || signed);
  const canContinueLLP =
    !!currency &&
    parsedAmount > 0 &&
    !exceedsAvailable &&
    !!method &&
    !!bankReady &&
    confirmChecked &&
    llpEligible &&
    (method === 'international_wire' || signed);

  const bank = allBanks.find((b) => b.id === selectedBank);

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
    return (
      <>
        {isHBP && (
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
        <SummaryRow label="Currency" value={currency || ''} />
        <SummaryRow label="Withdrawal amount" value={formatCurrency(parsedAmount, currency || 'CAD')} />
        {isDeregistration && (
          <SummaryRow label="Withholding tax" value={`-${formatCurrency(withholdingTax, currency || 'CAD')}`} />
        )}
        {(isHBP || isLLP) && <SummaryRow label="Withholding tax" value="$0.00" />}
        <SummaryRow
          label="Method"
          value={method === 'eft' ? 'EFT' : method === 'wire' ? 'Wire Transfer' : 'International Wire'}
        />
        {fee > 0 && <SummaryRow label="Fee" value={`-${formatCurrency(fee, currency || 'CAD')}`} />}
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
          <p className="font-semibold text-lg text-qt-green-dark">{formatCurrency(Math.max(0, net), currency || 'CAD')}</p>
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
    currency,
    fee,
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
    withdrawalTypeLabel,
  ]);

  const ctx = useMemo<RrspWizardCtx>(
    () => ({
      accountOptions: accounts,
      account,
      onAccountChange: handleAccountChange,
      onNavigateHome: () => navigate('/'),
      resetForm,
      rrspType,
      setRrspType,
      isDeregistration,
      isHBP,
      isLLP,
      isOvercontribution,
      combinedCad,
      combinedUsd,
      maxAmount,
      currency,
      setCurrency,
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
      showWithdrawalCurrency,
      onDepositBankSelectionKind,
      intlWire,
      setIntlWire,
      signed,
      setSigned,
      bankReady,
      hbpEligible,
      setHbpEligible,
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
      combinedCad,
      combinedUsd,
      confirmChecked,
      currency,
      exceedsAvailable,
      fee,
      grossAmount,
      handleAccountChange,
      hbpEligible,
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
      navigate,
      net,
      onDepositBankSelectionKind,
      parsedAmount,
      renderReviewSummary,
      resetForm,
      rrspType,
      selectedBank,
      showWithdrawalCurrency,
      signed,
      triggersConversion,
      withholdingTax,
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

  const shellProgress = useMemo(() => {
    if (!current) {
      return { stepIndex: 0, totalSteps: Math.max(1, wizardSteps.length - 3) };
    }
    return getRrspWizardShellProgress(wizardSteps, current.id);
  }, [wizardSteps, current]);

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
    <div className="flex flex-1 flex-col min-h-0 h-full w-full overflow-hidden">
      <WizardShell
        stepIndex={shellProgress.stepIndex}
        totalSteps={shellProgress.totalSteps}
        showBack={nav.stepIndex > 0}
        onBack={nav.goBack}
        onPrimary={handlePrimary}
        primaryLabel={primaryLabel}
        primaryDisabled={!canProceed}
        hideFooter={!!current.hideFooter}
      >
        {current.render(ctx)}
      </WizardShell>
    </div>
  );
}
