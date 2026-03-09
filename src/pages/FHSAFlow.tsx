import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, Download, ChevronDown } from 'lucide-react';
import TopNav from '../components/TopNav';
import Tooltip from '../components/Tooltip';
import AccountDropdown from '../components/AccountDropdown';
import BalanceCard from '../components/BalanceCard';
import CurrencySelector from '../components/CurrencySelector';
import CurrencyInput from '../components/CurrencyInput';
import MethodSelector from '../components/MethodSelector';
import BankSelector from '../components/BankSelector';
import InternationalWireForm from '../components/InternationalWireForm';
import RRSPCalculator from '../components/RRSPCalculator';
import FHSAEligibility from '../components/FHSAEligibility';
import ESignature from '../components/ESignature';
import Button from '../components/Button';
import InfoBox from '../components/InfoBox';
import RadioButton from '../components/RadioButton';
import WizardSection from '../components/WizardSection';
import { accounts, linkedBanks as defaultBanks, formatCurrency, formatAmountDisplay, stripFormatting, FX_RATE } from '../data/accounts';
import type { Account, Currency, WithdrawalMethod, LinkedBank, InternationalWireData, FHSAWithdrawalType } from '../types';

const fhsaOptions: { value: FHSAWithdrawalType; label: string; badge?: string }[] = [
  { value: 'qualifying', label: 'Qualifying (Home Purchase)' },
  { value: 'non_qualifying', label: 'Non-Qualifying', badge: 'Taxable' },
  { value: 'overcontribution', label: 'Overcontribution' },
];

export default function FHSAFlow() {
  const navigate = useNavigate();
  const fhsaAccounts = accounts.filter((a) => a.type === 'FHSA');
  const [account, setAccount] = useState<Account | null>(fhsaAccounts[0] || null);

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
    otherBrokerageAccount: '',
  });
  const [signed, setSigned] = useState(false);
  const [qualifyingFormChoice, setQualifyingFormChoice] = useState<'upload' | 'fillhere' | null>(null);
  const [qualifyingUploadedFile, setQualifyingUploadedFile] = useState<File | null>(null);
  const [qualifyingEligible, setQualifyingEligible] = useState(false);
  const [qualifyingData, setQualifyingData] = useState<Record<string, unknown>>({});
  const [confirmChecked, setConfirmChecked] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Overcontribution (RC727) state
  const [ovpExcessAmount, setOvpExcessAmount] = useState('');
  const [ovpSource, setOvpSource] = useState<'cash' | 'rrsp' | 'both' | null>(null);
  const [ovpRemovalMethod, setOvpRemovalMethod] = useState<'withdrawal' | 'transfer' | null>(null);
  const [ovpTransferAccount, setOvpTransferAccount] = useState<string | null>(null);
  const [ovpTaxUnderstood, setOvpTaxUnderstood] = useState(false);
  const [ovpAgreed, setOvpAgreed] = useState(false);
  const [ovpSigned, setOvpSigned] = useState(false);

  function handleAccountChange(acct: Account) {
    if (acct.type !== 'FHSA') {
      if (acct.type === 'RRSP') navigate('/withdraw/rrsp');
      else if (acct.type === 'RESP') navigate('/withdraw/resp');
      else navigate('/');
      return;
    }
    setAccount(acct);
    resetForm();
  }

  function resetForm() {
    setFhsaType('');
    setCurrency(null);
    setGrossAmount(0);
    setAmount('');
    setMethod(null);
    setSelectedBank(null);
    setSigned(false);
    setQualifyingFormChoice(null);
    setQualifyingUploadedFile(null);
    setQualifyingEligible(false);
    setQualifyingData({});
    setConfirmChecked(false);
    setShowSummary(false);
    setOvpExcessAmount('');
    setOvpSource(null);
    setOvpRemovalMethod(null);
    setOvpTransferAccount(null);
    setOvpTaxUnderstood(false);
    setOvpAgreed(false);
    setOvpSigned(false);
  }

  const cadAvailable = account ? account.balance.cad : 0;
  const usdAvailable = account ? account.balance.usd : 0;
  const combinedCad = cadAvailable + usdAvailable * FX_RATE;
  const combinedUsd = cadAvailable / FX_RATE + usdAvailable;
  const maxAmount = currency === 'CAD' ? combinedCad : currency === 'USD' ? combinedUsd : 0;
  const parsedAmount = parseFloat(amount) || 0;
  const exceedsAvailable = parsedAmount > maxAmount && parsedAmount > 0;
  const fee = method === 'wire' ? 20 : method === 'international_wire' ? 40 : 0;

  const isQualifying = fhsaType === 'qualifying';
  const isNonQualifying = fhsaType === 'non_qualifying';
  const isOvercontribution = fhsaType === 'overcontribution';

  const bankReady = method === 'international_wire'
    ? intlWire.bankName && intlWire.swiftCode
    : selectedBank;

  const canContinueQualifyingUpload =
    currency && parsedAmount > 0 && !exceedsAvailable && method && bankReady
    && qualifyingFormChoice === 'upload' && qualifyingUploadedFile && confirmChecked;

  const canContinueQualifyingFill =
    currency && parsedAmount > 0 && !exceedsAvailable && method && bankReady
    && qualifyingFormChoice === 'fillhere' && qualifyingEligible && confirmChecked;

  const canContinueQualifying = canContinueQualifyingUpload || canContinueQualifyingFill;

  const canContinueNonQualifying =
    currency && parsedAmount > 0 && !exceedsAvailable && method && bankReady;

  const rrspAccounts = accounts.filter((a) => a.type === 'RRSP');

  const ovpRemovalOptions = ovpSource === 'cash'
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

  const canContinueOvercontribution =
    currency && parsedAmount > 0 && !exceedsAvailable && method && bankReady
    && ovpExcessAmount && ovpSource && ovpRemovalMethod && ovpTransferReady
    && ovpTaxUnderstood && ovpAgreed && ovpSigned;

  function handleSubmit() {
    setSubmitted(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  if (submitted && account) {
    const typeLabel = isQualifying ? 'qualifying FHSA' : isNonQualifying ? 'non-qualifying FHSA' : 'FHSA overcontribution';
    return (
      <div className="min-h-screen flex flex-col bg-qt-white">
        <TopNav />
        <div className="flex-1 flex items-center justify-center">
          <div className="max-w-md text-center px-6">
            <div className="size-16 rounded-full bg-qt-green-bg flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 size={32} className="text-qt-green" />
            </div>
            <h2 className="font-display text-[28px] leading-[38px] text-qt-primary mb-3">
              Withdrawal submitted
            </h2>
            <p className="text-base text-qt-secondary leading-6 mb-2">
              Your {typeLabel} withdrawal request has been submitted.
            </p>
            <p className="text-sm text-qt-secondary leading-[22px] mb-8">
              Processing typically takes 1-3 business days. You'll receive a confirmation email shortly.
            </p>
            <Button onClick={() => { setSubmitted(false); setAccount(null); resetForm(); navigate('/'); }}>
              Start new withdrawal
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (showSummary && account) {
    return renderSummary();
  }

  return (
    <div className="min-h-screen flex flex-col bg-qt-white">
      <TopNav showExit onExit={() => navigate('/')} />
      <main className="flex-1">
        <div className="max-w-[680px] mx-auto w-full px-6 py-10">
          <h1 className="font-display text-[28px] leading-[38px] text-qt-primary mb-6">
            Withdraw funds
          </h1>

          <div className="flex flex-col gap-8">
            {/* Account Dropdown */}
            <section>
              <AccountDropdown value={account?.id || null} onChange={handleAccountChange} />
            </section>

            {/* Balance */}
            <WizardSection visible={!!account}>
              <section>
                {account && <BalanceCard account={account} />}
              </section>
            </WizardSection>

            {/* Withdrawal Type */}
            <WizardSection visible={!!account}>
              <section>
                <FHSATypeDropdown
                  value={fhsaType}
                  onChange={(v) => {
                    setFhsaType(v);
                    setCurrency(null);
                    setGrossAmount(0);
                    setAmount('');
                    setMethod(null);
                    setSelectedBank(null);
                    setSigned(false);
                    setQualifyingFormChoice(null);
                    setQualifyingUploadedFile(null);
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
                  }}
                />
              </section>
            </WizardSection>

            {/* Currency Selection */}
            <WizardSection visible={!!fhsaType}>
              <section>
                <CurrencySelector
                  value={currency}
                  onChange={(c) => { setCurrency(c); setGrossAmount(0); setAmount(''); }}
                  cadAmount={combinedCad}
                  usdAmount={combinedUsd}
                />
              </section>
            </WizardSection>

            {/* Non-Qualifying: Calculator + withdrawal amount */}
            <WizardSection visible={isNonQualifying && !!currency}>
              <section className="flex flex-col gap-6">
                <RRSPCalculator
                  currency={currency || 'CAD'}
                  onAmountChange={(g) => {
                    setGrossAmount(g);
                    setAmount(g > 0 ? g.toFixed(2) : '');
                  }}
                />
                {grossAmount > 0 && (
                  <div className="bg-qt-bg-3 rounded-lg p-4 animate-[fadeSlideIn_0.3s_ease-out]">
                    <p className="text-xs text-qt-secondary mb-1">Withdrawal amount</p>
                    <p className="text-lg font-semibold text-qt-primary">
                      {formatCurrency(grossAmount, currency || 'CAD')}
                    </p>
                    <p className="text-xs text-qt-secondary mt-1">Based on gross amount from calculator above</p>
                    {exceedsAvailable && (
                      <p className="text-sm font-semibold text-qt-red mt-2">
                        Amount exceeds available balance of {formatCurrency(maxAmount, currency!)}
                      </p>
                    )}
                  </div>
                )}
              </section>
            </WizardSection>

            {/* Qualifying / Overcontribution: plain amount */}
            <WizardSection visible={(isQualifying || isOvercontribution) && !!currency}>
              <section>
                <CurrencyInput
                  label="Gross withdrawal amount"
                  value={amount}
                  onChange={(val) => {
                    setAmount(val);
                    if (isOvercontribution) setOvpExcessAmount(val);
                  }}
                  error={exceedsAvailable ? `Amount exceeds available balance of ${formatCurrency(maxAmount, currency!)}` : undefined}
                />
              </section>
            </WizardSection>

            {/* Method */}
            <WizardSection visible={parsedAmount > 0 && !exceedsAvailable}>
              <section>
                <MethodSelector value={method} onChange={(m) => { setMethod(m); setSelectedBank(null); }} />
              </section>
            </WizardSection>

            {/* Bank (EFT or Wire) */}
            <WizardSection visible={!!method && method !== 'international_wire'}>
              <section>
                <BankSelector
                  value={selectedBank}
                  onChange={setSelectedBank}
                  allBanks={allBanks}
                  onBanksChange={setAllBanks}
                />
              </section>
            </WizardSection>

            {/* International Wire */}
            <WizardSection visible={method === 'international_wire'}>
              <section>
                <InternationalWireForm
                  currency={currency || 'CAD'}
                  amount={amount}
                  data={intlWire}
                  onChange={setIntlWire}
                />
                <div className="mt-6">
                  <ESignature onSign={() => setSigned(true)} signed={signed} />
                </div>
              </section>
            </WizardSection>

            {/* Qualifying: Form choice */}
            <WizardSection visible={isQualifying && !!bankReady}>
              <section className="flex flex-col gap-4">
                <div>
                  <p className="font-semibold text-sm text-qt-primary mb-1">RC725 — Qualifying withdrawal form</p>
                  <p className="text-sm text-qt-secondary leading-relaxed">
                    To meet government requirements, we need a completed RC725 form to process your request. Tell us how you'd like to complete your withdrawal form.
                  </p>
                </div>

                {/* Option 1: Upload */}
                <button
                  type="button"
                  onClick={() => { setQualifyingFormChoice('upload'); setQualifyingEligible(false); setQualifyingData({}); }}
                  className={`w-full rounded-lg border-2 p-5 text-left transition-all cursor-pointer ${
                    qualifyingFormChoice === 'upload'
                      ? 'border-qt-green bg-qt-green-bg/30'
                      : 'border-qt-border hover:border-qt-gray-dark bg-white'
                  }`}
                >
                  <p className="font-semibold text-sm text-qt-primary mb-1">Upload a completed form</p>
                  <p className="text-sm text-qt-secondary leading-relaxed">
                    Download, sign, and upload your document manually.
                  </p>
                  <a
                    href="https://www.canada.ca/en/revenue-agency/services/forms-publications/forms/rc725.html"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="inline-flex items-center gap-1 text-sm font-semibold text-qt-green-dark hover:underline mt-2"
                  >
                    Download RC725 from Canada.ca &rarr;
                  </a>
                </button>

                {/* Option 2: Fill here */}
                <button
                  type="button"
                  onClick={() => { setQualifyingFormChoice('fillhere'); setQualifyingUploadedFile(null); }}
                  className={`w-full rounded-lg border-2 p-5 text-left transition-all cursor-pointer ${
                    qualifyingFormChoice === 'fillhere'
                      ? 'border-qt-green bg-qt-green-bg/30'
                      : 'border-qt-border hover:border-qt-gray-dark bg-white'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-semibold text-sm text-qt-primary">Fill it out here</p>
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-qt-green text-white leading-none">
                      Recommended
                    </span>
                  </div>
                  <p className="text-sm text-qt-secondary leading-relaxed">
                    Answer a few questions and we'll generate the form for you. Estimated time to complete: 2 minutes.
                  </p>
                </button>
              </section>
            </WizardSection>

            {/* Qualifying: Upload form */}
            <WizardSection visible={isQualifying && qualifyingFormChoice === 'upload'}>
              <section className="flex flex-col gap-4">
                <p className="font-semibold text-sm text-qt-primary">Upload your completed RC725 form</p>
                <div
                  className="border-2 border-dashed border-qt-border rounded-lg p-8 text-center hover:border-qt-gray-dark transition-colors cursor-pointer"
                  onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                  onDrop={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (e.dataTransfer.files?.[0]) setQualifyingUploadedFile(e.dataTransfer.files[0]);
                  }}
                  onClick={() => document.getElementById('rc725-upload')?.click()}
                >
                  <input
                    id="rc725-upload"
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    className="hidden"
                    onChange={(e) => { if (e.target.files?.[0]) setQualifyingUploadedFile(e.target.files[0]); }}
                  />
                  {qualifyingUploadedFile ? (
                    <div className="flex flex-col items-center gap-2">
                      <CheckCircle2 size={24} className="text-qt-green" />
                      <p className="text-sm font-semibold text-qt-primary">{qualifyingUploadedFile.name}</p>
                      <p className="text-xs text-qt-secondary">Click or drag to replace</p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      <Download size={24} className="text-qt-secondary rotate-180" />
                      <p className="text-sm text-qt-primary">Drag & drop your file here, or <span className="font-semibold text-qt-green-dark">browse</span></p>
                      <p className="text-xs text-qt-secondary">Accepted formats: PDF, JPG, PNG</p>
                    </div>
                  )}
                </div>
              </section>
            </WizardSection>

            {/* Qualifying Eligibility (fill here option) */}
            <WizardSection visible={isQualifying && qualifyingFormChoice === 'fillhere'}>
              <section>
                <FHSAEligibility
                  onComplete={(elig, data) => { setQualifyingEligible(elig); setQualifyingData(data as unknown as Record<string, unknown>); }}
                  withdrawalAmount={amount}
                  onWithdrawalAmountChange={setAmount}
                />
              </section>
            </WizardSection>

            {/* Qualifying confirmation checkbox */}
            <WizardSection visible={isQualifying && (qualifyingEligible || (qualifyingFormChoice === 'upload' && !!qualifyingUploadedFile))}>
              <section>
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={confirmChecked}
                    onChange={(e) => setConfirmChecked(e.target.checked)}
                    className="mt-1 size-4 accent-qt-green cursor-pointer"
                  />
                  <span className="text-sm text-qt-primary leading-[22px]">
                    I confirm that the information I've provided is true and accurate
                  </span>
                </label>
              </section>
            </WizardSection>

            {/* Continue - Qualifying */}
            <WizardSection visible={isQualifying && !!canContinueQualifying}>
              <div className="flex gap-3 pt-2 border-t border-qt-border">
                <Button variant="secondary" onClick={() => navigate('/')}>Cancel</Button>
                <Button onClick={() => { setShowSummary(true); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
                  Continue
                </Button>
              </div>
            </WizardSection>

            {/* Continue - Non-Qualifying */}
            <WizardSection visible={isNonQualifying && !!canContinueNonQualifying}>
              <div className="flex gap-3 pt-2 border-t border-qt-border">
                <Button variant="secondary" onClick={() => navigate('/')}>Cancel</Button>
                <Button onClick={() => { setShowSummary(true); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
                  Continue
                </Button>
              </div>
            </WizardSection>

            {/* Overcontribution: RC727 Questionnaire */}
            <WizardSection visible={isOvercontribution && !!bankReady}>
              <section className="flex flex-col gap-6">
                <h3 className="font-semibold text-sm text-qt-primary">RC727 — Remove excess FHSA contributions</h3>

                {/* Pre-filled profile info */}
                <div className="bg-qt-bg-3 rounded-lg p-4 flex flex-col gap-2">
                  <p className="text-xs text-qt-secondary uppercase font-bold tracking-wider mb-1">Taxpayer Information</p>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                    <div><span className="text-qt-secondary">Name:</span> <span className="font-semibold text-qt-primary">Anastasia Carmichael</span></div>
                    <div><span className="text-qt-secondary">SIN:</span> <span className="font-semibold text-qt-primary">•••-•••-123</span></div>
                    <div><span className="text-qt-secondary">Address:</span> <span className="font-semibold text-qt-primary">42 Queen St W, Toronto ON</span></div>
                    <div><span className="text-qt-secondary">Phone:</span> <span className="font-semibold text-qt-primary">(416) 555-0199</span></div>
                  </div>
                </div>

                {/* Excess amount — synced bidirectionally with gross withdrawal amount */}
                <div className="flex flex-col gap-2">
                  <label className="font-semibold text-sm text-qt-primary">
                    How much is your excess FHSA amount (the amount you overcontributed)?
                  </label>
                  <div className="max-w-xs">
                    <CurrencyInput
                      label=""
                      value={ovpExcessAmount}
                      onChange={(val) => {
                        setOvpExcessAmount(val);
                        setAmount(val);
                      }}
                    />
                  </div>
                </div>

                {/* Source of excess */}
                <WizardSection visible={!!ovpExcessAmount && parseFloat(stripFormatting(ovpExcessAmount)) > 0}>
                  <div className="flex flex-col gap-3">
                    <p className="font-semibold text-sm text-qt-primary">
                      How did the excess money originally get into your FHSA?
                    </p>
                    <RadioButton
                      name="ovpSource"
                      value="cash"
                      label="I deposited cash directly from my bank account"
                      checked={ovpSource === 'cash'}
                      onChange={() => { setOvpSource('cash'); setOvpRemovalMethod(null); setOvpTransferAccount(null); }}
                    />
                    <RadioButton
                      name="ovpSource"
                      value="rrsp"
                      label="I transferred the money in from my RRSP"
                      checked={ovpSource === 'rrsp'}
                      onChange={() => { setOvpSource('rrsp'); setOvpRemovalMethod(null); setOvpTransferAccount(null); }}
                    />
                    <RadioButton
                      name="ovpSource"
                      value="both"
                      label="A mix of both cash deposits and RRSP transfers"
                      checked={ovpSource === 'both'}
                      onChange={() => { setOvpSource('both'); setOvpRemovalMethod(null); setOvpTransferAccount(null); }}
                    />
                  </div>
                </WizardSection>

                {/* Removal method */}
                <WizardSection visible={!!ovpSource}>
                  <div className="flex flex-col gap-3">
                    <p className="font-semibold text-sm text-qt-primary">
                      How would you like to remove these excess funds today?
                    </p>
                    {ovpRemovalOptions.map((opt) => (
                      <RadioButton
                        key={opt.value}
                        name="ovpRemoval"
                        value={opt.value}
                        label={opt.label}
                        checked={ovpRemovalMethod === opt.value}
                        onChange={() => { setOvpRemovalMethod(opt.value); setOvpTransferAccount(null); }}
                      />
                    ))}
                  </div>
                </WizardSection>

                {/* Q4: RRSP account (if transfer) */}
                <WizardSection visible={ovpRemovalMethod === 'transfer'}>
                  <div className="flex flex-col gap-2">
                    <label className="font-semibold text-sm text-qt-primary">
                      Which retirement account would you like to transfer the funds into?
                    </label>
                    <select
                      value={ovpTransferAccount || ''}
                      onChange={(e) => setOvpTransferAccount(e.target.value || null)}
                      className="w-full h-12 rounded-md border border-qt-gray-dark bg-white px-4 text-sm text-qt-primary outline-none focus:border-qt-green cursor-pointer"
                    >
                      <option value="">Select an account</option>
                      {rrspAccounts.map((a) => (
                        <option key={a.id} value={a.id}>{a.label} - {a.accountNumber}</option>
                      ))}
                    </select>
                  </div>
                </WizardSection>

                {/* Tax reminder */}
                <WizardSection visible={!!ovpRemovalMethod && ovpTransferReady}>
                  <div className="flex flex-col gap-4">
                    <InfoBox variant="warning">
                      <div className="flex flex-col gap-1">
                        <p className="font-semibold">Important Tax Reminder</p>
                        <p className="text-sm">
                          Removing the excess funds stops the ongoing 1% monthly penalty, but you are still required to file <strong>Form RC728</strong> to pay the penalty for the months the excess funds sat in your account.
                        </p>
                      </div>
                    </InfoBox>
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={ovpTaxUnderstood}
                        onChange={(e) => setOvpTaxUnderstood(e.target.checked)}
                        className="mt-1 size-4 accent-qt-green cursor-pointer"
                      />
                      <span className="text-sm text-qt-primary leading-[22px]">I understand</span>
                    </label>
                  </div>
                </WizardSection>

                {/* E-Signature */}
                <WizardSection visible={ovpTaxUnderstood}>
                  <div className="flex flex-col gap-4">
                    <ESignature onSign={() => setOvpSigned(true)} signed={ovpSigned} />
                  </div>
                </WizardSection>

                {/* Final declaration */}
                <WizardSection visible={ovpSigned}>
                  <div className="border border-qt-border rounded-lg p-5 bg-qt-bg-3">
                    <p className="text-sm text-qt-primary leading-[22px] mb-4">
                      I certify that the information provided is correct and I authorize this designation to remove my excess FHSA amount.
                    </p>
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={ovpAgreed}
                        onChange={(e) => setOvpAgreed(e.target.checked)}
                        className="mt-1 size-4 accent-qt-green cursor-pointer"
                      />
                      <span className="text-sm font-semibold text-qt-primary">I agree</span>
                    </label>
                  </div>
                </WizardSection>
              </section>
            </WizardSection>

            {/* Continue - Overcontribution */}
            <WizardSection visible={isOvercontribution && !!canContinueOvercontribution}>
              <div className="flex gap-3 pt-2 border-t border-qt-border">
                <Button variant="secondary" onClick={() => navigate('/')}>Cancel</Button>
                <Button onClick={() => { setShowSummary(true); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
                  Continue
                </Button>
              </div>
            </WizardSection>
          </div>

          <div className="mt-8">
            <a href="#" className="text-xs font-semibold text-qt-green-dark hover:underline">View disclosure</a>
          </div>
        </div>
      </main>
    </div>
  );

  function renderSummary() {
    if (!account) return null;
    const bank = allBanks.find((b) => b.id === selectedBank);
    const withholdingTax = isNonQualifying
      ? (parsedAmount <= 5000 ? parsedAmount * 0.1 : parsedAmount <= 15000 ? parsedAmount * 0.2 : parsedAmount * 0.3)
      : 0;
    const net = parsedAmount - withholdingTax - fee;

    const typeLabel = isQualifying
      ? 'Qualifying (Home Purchase)'
      : isNonQualifying
        ? 'Non-Qualifying'
        : 'Overcontribution';

    return (
      <div className="min-h-screen flex flex-col bg-qt-white">
        <TopNav showExit onExit={() => setShowSummary(false)} />
        <main className="flex-1">
          <div className="max-w-[680px] mx-auto w-full px-6 py-10">
            <h2 className="font-display text-[28px] leading-[38px] text-qt-primary mb-6">
              Review & confirm
            </h2>

            {isQualifying && !!qualifyingData.street && (
              <div className="bg-white border border-qt-border rounded-lg divide-y divide-qt-border mb-6">
                <SummaryRow label="Account holder" value="Anastasia Carmichael" />
                <SummaryRow
                  label="Property address"
                  value={`${String(qualifyingData.street)}, ${String(qualifyingData.city)}, ${String(qualifyingData.province)} ${String(qualifyingData.postalCode)}`}
                />
              </div>
            )}

            <div className="bg-white border border-qt-border rounded-lg divide-y divide-qt-border mb-6">
              <SummaryRow label="Account" value={`${account.label} - ${account.accountNumber}`} />
              <SummaryRow label="Withdrawal type" value={typeLabel} />
              <SummaryRow label="Currency" value={currency || ''} />
              <SummaryRow label="Withdrawal amount" value={formatCurrency(parsedAmount, currency || 'CAD')} />
              {isNonQualifying && (
                <SummaryRow label="Withholding tax" value={`-${formatCurrency(withholdingTax, currency || 'CAD')}`} tooltip="Questrade must make this tax payment to the CRA on your behalf" />
              )}
              {isQualifying && (
                <SummaryRow label="Withholding tax" value="$0.00 (Tax-free)" />
              )}
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
              <div className="flex items-center justify-between px-5 py-4 bg-qt-bg-3">
                <p className="font-semibold text-base text-qt-primary">Estimated amount received</p>
                <p className="font-semibold text-lg text-qt-green-dark">{formatCurrency(Math.max(0, net), currency || 'CAD')}</p>
              </div>
            </div>

            {isQualifying && qualifyingFormChoice === 'fillhere' && (
              <div className="mb-6">
                <button className="flex items-center gap-2 text-sm font-semibold text-qt-green-dark hover:underline cursor-pointer">
                  <Download size={16} />
                  Download pre-filled RC725 form
                </button>
                <p className="text-xs text-qt-secondary mt-2">A copy will also be emailed to you.</p>
              </div>
            )}

            {isQualifying && qualifyingFormChoice === 'upload' && qualifyingUploadedFile && (
              <div className="bg-qt-bg-3 border border-qt-border rounded-lg p-4 mb-6">
                <p className="text-sm text-qt-primary">
                  <CheckCircle2 size={16} className="inline text-qt-green mr-1.5 -mt-0.5" />
                  RC725 form uploaded: <span className="font-semibold">{qualifyingUploadedFile.name}</span>
                </p>
              </div>
            )}

            {isOvercontribution && (
              <div className="flex flex-col gap-4 mb-6">
                <div className="bg-white border border-qt-border rounded-lg divide-y divide-qt-border">
                  <SummaryRow label="Excess amount" value={ovpExcessAmount} />
                  <SummaryRow
                    label="Source of excess"
                    value={ovpSource === 'cash' ? 'Cash deposit' : ovpSource === 'rrsp' ? 'RRSP transfer' : 'Cash + RRSP transfer'}
                  />
                  <SummaryRow
                    label="Removal method"
                    value={ovpRemovalMethod === 'withdrawal' ? 'Designated Withdrawal (Cash)' : 'Designated Transfer (RRSP/PRPP)'}
                  />
                  {ovpRemovalMethod === 'transfer' && ovpTransferAccount && (
                    <SummaryRow
                      label="Transfer to"
                      value={(() => { const a = rrspAccounts.find((r) => r.id === ovpTransferAccount); return a ? `${a.label} - ${a.accountNumber}` : ''; })()}
                    />
                  )}
                </div>
                <button className="flex items-center gap-2 text-sm font-semibold text-qt-green-dark hover:underline cursor-pointer">
                  <Download size={16} />
                  Download pre-filled RC727 form
                </button>
                <p className="text-xs text-qt-secondary">A copy will also be emailed to you.</p>
              </div>
            )}

            <div className="flex gap-3">
              <Button variant="secondary" onClick={() => setShowSummary(false)}>Back</Button>
              <Button onClick={handleSubmit}>Submit withdrawal</Button>
            </div>

            <div className="mt-6">
              <a href="#" className="text-xs font-semibold text-qt-green-dark hover:underline">View disclosure</a>
            </div>
          </div>
        </main>
      </div>
    );
  }
}

function FHSATypeDropdown({
  value,
  onChange,
}: {
  value: FHSAWithdrawalType | '';
  onChange: (v: FHSAWithdrawalType) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const selected = fhsaOptions.find((o) => o.value === value);

  return (
    <div className="flex flex-col gap-1" ref={ref}>
      <label className="font-semibold text-sm text-qt-primary">Withdrawal type</label>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`relative w-full h-12 rounded-md border bg-white px-4 pr-10 text-left text-sm text-qt-primary
          outline-none transition-colors cursor-pointer flex items-center gap-2
          ${open ? 'border-qt-green' : 'border-qt-gray-dark'}`}
      >
        {selected ? (
          <>
            <span className="text-xs font-bold tracking-wider uppercase">{selected.label}</span>
            {selected.badge && (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-qt-green text-white leading-none">
                {selected.badge}
              </span>
            )}
          </>
        ) : (
          <span className="text-qt-secondary italic">Select withdrawal type</span>
        )}
        <ChevronDown
          size={20}
          className={`absolute right-3 top-1/2 -translate-y-1/2 text-qt-secondary transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {open && (
        <div className="border border-qt-border rounded-md bg-white shadow-lg overflow-hidden animate-[fadeSlideIn_0.15s_ease-out]">
          {fhsaOptions.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => { onChange(opt.value); setOpen(false); }}
              className={`w-full px-4 py-3 text-left flex items-center gap-2 cursor-pointer transition-colors
                ${value === opt.value ? 'bg-qt-green-bg/30' : 'hover:bg-qt-bg-3'}`}
            >
              <span className="text-xs font-bold tracking-wider uppercase text-qt-primary">{opt.label}</span>
              {opt.badge && (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-qt-green text-white leading-none">
                  {opt.badge}
                </span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function SummaryRow({ label, value, tooltip }: { label: string; value: string; tooltip?: string }) {
  return (
    <div className="flex items-center justify-between px-5 py-4">
      <p className="text-sm text-qt-secondary flex items-center gap-1.5">
        {label}
        {tooltip && <Tooltip content={tooltip} />}
      </p>
      <p className="text-sm font-semibold text-qt-primary text-right max-w-[60%]">{value}</p>
    </div>
  );
}
