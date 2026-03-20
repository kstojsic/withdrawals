import { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, Download } from 'lucide-react';
import WizardShell from '../components/WizardShell';
import MobileButton from '../components/MobileButton';
import { useWizardNavigation } from '../wizard/useWizardNavigation';
import { buildFhsaWizardSteps, getFhsaWizardShellProgress, type FhsaWizardCtx } from '../wizard/fhsaWizard';
import { accounts, linkedBanks as defaultBanks, formatCurrency, FX_RATE, FX_BUFFER } from '../../data/accounts';
import type { Account, Currency, WithdrawalMethod, LinkedBank, InternationalWireData, FHSAWithdrawalType } from '../../types';

function MobileSummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between px-3 py-2 gap-2">
      <p className="text-xs text-qt-secondary shrink-0">{label}</p>
      <p className="text-xs font-semibold text-qt-primary text-right max-w-[58%] break-words">{value}</p>
    </div>
  );
}

export default function MobileFHSAFlow() {
  const navigate = useNavigate();
  const rrspAccounts = useMemo(() => accounts.filter((a) => a.type === 'RRSP'), []);
  const [account, setAccount] = useState<Account | null>(() => accounts.find((a) => a.type === 'FHSA') ?? null);

  const [fhsaType, setFhsaType] = useState<FHSAWithdrawalType | ''>('');
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
  const [qualifyingEligible, setQualifyingEligible] = useState(false);
  const [qualifyingData, setQualifyingData] = useState<Record<string, unknown>>({});
  const [confirmChecked, setConfirmChecked] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [ovpExcessAmount, setOvpExcessAmount] = useState('');
  const [ovpSource, setOvpSource] = useState<'cash' | 'rrsp' | 'both' | null>(null);
  const [ovpRemovalMethod, setOvpRemovalMethod] = useState<'withdrawal' | 'transfer' | null>(null);
  const [ovpTransferAccount, setOvpTransferAccount] = useState<string | null>(null);
  const [ovpTaxUnderstood, setOvpTaxUnderstood] = useState(false);
  const [ovpAgreed, setOvpAgreed] = useState(false);
  const [ovpSigned, setOvpSigned] = useState(false);
  const [depositBankFromNewLink, setDepositBankFromNewLink] = useState(false);

  const wizardSteps = useMemo(() => buildFhsaWizardSteps(), []);

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
    setFhsaType('');
    setCurrency(null);
    setGrossAmount(0);
    setAmount('');
    setMethod(null);
    setSelectedBank(null);
    setDepositBankFromNewLink(false);
    setSigned(false);
    setQualifyingEligible(false);
    setQualifyingData({});
    setConfirmChecked(false);
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
  const triggersConversion =
    parsedAmount > (currency === 'CAD' ? cadAvailable : currency === 'USD' ? usdAvailable : 0) &&
    !exceedsAvailable &&
    parsedAmount > 0;
  const fee = method === 'wire' ? (currency === 'USD' ? 30 : 20) : method === 'international_wire' ? 40 : 0;

  const isQualifying = fhsaType === 'qualifying';
  const isNonQualifying = fhsaType === 'non_qualifying';
  const isOvercontribution = fhsaType === 'overcontribution';

  const bankReady =
    method === 'international_wire'
      ? !!(intlWire.bankName && intlWire.swiftCode)
      : !!selectedBank;

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

  const withholdingTax = isNonQualifying
    ? parsedAmount <= 5000
      ? parsedAmount * 0.1
      : parsedAmount <= 15000
        ? parsedAmount * 0.2
        : parsedAmount * 0.3
    : 0;
  const net = parsedAmount - withholdingTax - fee;

  const canContinueQualifying =
    !!currency &&
    parsedAmount > 0 &&
    !exceedsAvailable &&
    !!method &&
    !!bankReady &&
    qualifyingEligible &&
    confirmChecked;
  const canContinueNonQualifying =
    !!currency && parsedAmount > 0 && !exceedsAvailable && !!method && !!bankReady;
  const canContinueOvercontribution =
    !!currency &&
    parsedAmount > 0 &&
    !exceedsAvailable &&
    !!method &&
    !!bankReady &&
    !!ovpExcessAmount &&
    !!ovpSource &&
    !!ovpRemovalMethod &&
    ovpTransferReady &&
    ovpTaxUnderstood &&
    ovpAgreed &&
    ovpSigned;

  const bank = allBanks.find((b) => b.id === selectedBank);

  const typeLabel = isQualifying ? 'Qualifying (Home Purchase)' : isNonQualifying ? 'Non-Qualifying' : 'Overcontribution';

  const renderReviewSummary = useCallback(() => {
    if (!account) return null;
    return (
      <>
        {isQualifying && !!qualifyingData.street && (
          <>
            <MobileSummaryRow label="Account holder" value="Anastasia Carmichael" />
            <MobileSummaryRow
              label="Property address"
              value={`${String(qualifyingData.street)}, ${String(qualifyingData.city)}, ${String(qualifyingData.province)} ${String(qualifyingData.postalCode)}`}
            />
          </>
        )}
        <MobileSummaryRow label="Account" value={`${account.label} - ${account.accountNumber}`} />
        <MobileSummaryRow label="Withdrawal type" value={typeLabel} />
        <MobileSummaryRow label="Currency" value={currency || ''} />
        <MobileSummaryRow label="Withdrawal amount" value={formatCurrency(parsedAmount, currency || 'CAD')} />
        {isNonQualifying && (
          <MobileSummaryRow label="Withholding tax" value={`-${formatCurrency(withholdingTax, currency || 'CAD')}`} />
        )}
        {isQualifying && <MobileSummaryRow label="Withholding tax" value="$0.00 (Tax-free)" />}
        <MobileSummaryRow
          label="Method"
          value={method === 'eft' ? 'EFT' : method === 'wire' ? 'Wire Transfer' : 'International Wire'}
        />
        {fee > 0 && <MobileSummaryRow label="Fee" value={`-${formatCurrency(fee, currency || 'CAD')}`} />}
        {method !== 'international_wire' && bank && (
          <MobileSummaryRow label="Bank" value={`${bank.name} - ****${bank.last4}`} />
        )}
        {method === 'international_wire' && (
          <>
            <MobileSummaryRow label="International bank" value={intlWire.bankName} />
            <MobileSummaryRow label="SWIFT code" value={intlWire.swiftCode} />
          </>
        )}
        <div className="flex items-center justify-between px-4 py-4 bg-qt-bg-3">
          <p className="font-semibold text-base text-qt-primary">Withdrawal amount requested</p>
          <p className="font-semibold text-lg text-qt-green-dark">{formatCurrency(Math.max(0, net), currency || 'CAD')}</p>
        </div>
        {isQualifying && (
          <div className="px-4 py-3">
            <button
              type="button"
              className="flex items-center gap-2 text-sm font-semibold text-qt-green-dark"
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
              <Download size={16} /> Download pre-filled RC725
            </button>
          </div>
        )}
        {isOvercontribution && (
          <div className="px-4 py-3 space-y-2">
            <MobileSummaryRow
              label="Excess amount"
              value={ovpExcessAmount ? formatCurrency(parseFloat(ovpExcessAmount) || 0, currency || 'CAD') : ''}
            />
            <button
              type="button"
              className="flex items-center gap-2 text-sm font-semibold text-qt-green-dark"
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
              <Download size={16} /> Download pre-filled RC727
            </button>
          </div>
        )}
      </>
    );
  }, [
    account,
    bank,
    currency,
    fee,
    intlWire.bankName,
    intlWire.swiftCode,
    isNonQualifying,
    isOvercontribution,
    isQualifying,
    method,
    net,
    ovpExcessAmount,
    parsedAmount,
    qualifyingData.city,
    qualifyingData.postalCode,
    qualifyingData.province,
    qualifyingData.street,
    typeLabel,
    withholdingTax,
  ]);

  const ctx = useMemo<FhsaWizardCtx>(
    () => ({
      accountOptions: accounts,
      rrspAccounts,
      account,
      onAccountChange: handleAccountChange,
      resetForm,
      fhsaType,
      setFhsaType,
      isQualifying,
      isNonQualifying,
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
      qualifyingEligible,
      setQualifyingEligible,
      qualifyingData,
      setQualifyingData,
      confirmChecked,
      setConfirmChecked,
      ovpExcessAmount,
      setOvpExcessAmount,
      ovpSource,
      setOvpSource,
      ovpRemovalMethod,
      setOvpRemovalMethod,
      ovpTransferAccount,
      setOvpTransferAccount,
      ovpRemovalOptions,
      ovpTransferReady,
      ovpTaxUnderstood,
      setOvpTaxUnderstood,
      ovpAgreed,
      setOvpAgreed,
      ovpSigned,
      setOvpSigned,
      fee,
      netAmount: net,
      withholdingTax,
      canContinueQualifying,
      canContinueNonQualifying,
      canContinueOvercontribution,
      renderReviewSummary,
    }),
    [
      account,
      allBanks,
      amount,
      bankReady,
      canContinueNonQualifying,
      canContinueOvercontribution,
      canContinueQualifying,
      combinedCad,
      combinedUsd,
      confirmChecked,
      currency,
      exceedsAvailable,
      fee,
      fhsaType,
      grossAmount,
      handleAccountChange,
      intlWire,
      isNonQualifying,
      isOvercontribution,
      isQualifying,
      maxAmount,
      method,
      net,
      onDepositBankSelectionKind,
      ovpAgreed,
      ovpExcessAmount,
      ovpRemovalMethod,
      ovpRemovalOptions,
      ovpSigned,
      ovpSource,
      ovpTaxUnderstood,
      ovpTransferAccount,
      ovpTransferReady,
      parsedAmount,
      qualifyingData,
      qualifyingEligible,
      renderReviewSummary,
      resetForm,
      rrspAccounts,
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
      return { stepIndex: 0, totalSteps: Math.max(1, wizardSteps.length - 1) };
    }
    return getFhsaWizardShellProgress(wizardSteps, current.id);
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
        <div className="bg-white border border-[#E5E7EB] rounded-lg divide-y divide-[#E5E7EB] mb-6">
          {renderReviewSummary()}
        </div>
        <p className="text-base text-qt-secondary leading-6 mb-2 text-center">
          Your {typeLabel} withdrawal request has been submitted.
        </p>
        <p className="text-sm text-qt-secondary leading-[22px] mb-8 text-center">
          Processing typically takes 1–3 business days. You&apos;ll receive a confirmation email shortly.
        </p>
        <MobileButton
          onClick={() => {
            setSubmitted(false);
            setAccount(accounts.find((a) => a.type === 'FHSA') ?? null);
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
