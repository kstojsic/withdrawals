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
import HBPEligibility from '../components/HBPEligibility';
import LLPEligibility from '../components/LLPEligibility';
import AddressInput from '../components/AddressInput';
import ESignature from '../components/ESignature';
import Button from '../components/Button';
import InfoBox from '../components/InfoBox';
import WizardSection from '../components/WizardSection';
import { accounts, linkedBanks as defaultBanks, formatCurrency, FX_RATE } from '../data/accounts';
import type { Account, Currency, WithdrawalMethod, LinkedBank, InternationalWireData, RRSPWithdrawalType } from '../types';

const rrspOptions: { value: RRSPWithdrawalType; label: string; badge?: string }[] = [
  { value: 'deregistration', label: 'Deregistration (Retirement or Another Reason)', badge: 'Taxable' },
  { value: 'hbp', label: "Home Buyer's Plan" },
  { value: 'llp', label: 'Lifelong Learning Plan' },
  { value: 'overcontribution', label: 'Overcontribution' },
];

export default function RRSPFlow() {
  const navigate = useNavigate();
  const rrspAccounts = accounts.filter((a) => a.type === 'RRSP');
  const [account, setAccount] = useState<Account | null>(rrspAccounts[0] || null);

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
    otherBrokerageAccount: '',
  });
  const [signed, setSigned] = useState(false);
  const [hbpFormChoice, setHbpFormChoice] = useState<'upload' | 'fillhere' | null>(null);
  const [hbpUploadedFile, setHbpUploadedFile] = useState<File | null>(null);
  const [hbpEligible, setHbpEligible] = useState<boolean | null>(null);
  const [llpFormChoice, setLlpFormChoice] = useState<'upload' | 'fillhere' | null>(null);
  const [llpUploadedFile, setLlpUploadedFile] = useState<File | null>(null);
  const [llpEligible, setLlpEligible] = useState(false);
  const [llpData, setLlpData] = useState<Record<string, unknown>>({});
  const [ovpFormMailed, setOvpFormMailed] = useState(false);
  const [address, setAddress] = useState({ street: '', city: '', province: '', postalCode: '' });
  const [confirmChecked, setConfirmChecked] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  function handleAccountChange(acct: Account) {
    if (acct.type === 'FHSA') {
      navigate('/withdraw/fhsa');
      return;
    }
    if (acct.type === 'RESP') {
      navigate('/withdraw/resp');
      return;
    }
    if (acct.type !== 'RRSP') {
      navigate('/');
      return;
    }
    setAccount(acct);
    resetForm();
  }

  function resetForm() {
    setRrspType('');
    setCurrency(null);
    setAmount('');
    setMethod(null);
    setSelectedBank(null);
    setGrossAmount(0);
    setHbpFormChoice(null);
    setHbpUploadedFile(null);
    setHbpEligible(null);
    setLlpFormChoice(null);
    setLlpUploadedFile(null);
    setLlpEligible(false);
    setLlpData({});
    setOvpFormMailed(false);
    setSigned(false);
    setConfirmChecked(false);
    setShowSummary(false);
  }

  const cadAvailable = account ? account.balance.cad : 0;
  const usdAvailable = account ? account.balance.usd : 0;
  const combinedCad = cadAvailable + usdAvailable * FX_RATE;
  const combinedUsd = cadAvailable / FX_RATE + usdAvailable;
  const maxAmount = currency === 'CAD' ? combinedCad : currency === 'USD' ? combinedUsd : 0;
  const parsedAmount = parseFloat(amount) || 0;
  const exceedsAvailable = parsedAmount > maxAmount && parsedAmount > 0;
  const singleCurrencyBalance = currency === 'CAD' ? cadAvailable : currency === 'USD' ? usdAvailable : 0;
  const triggersConversion = parsedAmount > singleCurrencyBalance && !exceedsAvailable && parsedAmount > 0;
  const fee = method === 'wire' ? 20 : method === 'international_wire' ? 40 : 0;

  const isDeregistration = rrspType === 'deregistration';
  const isHBP = rrspType === 'hbp';
  const isLLP = rrspType === 'llp';
  const isOvercontribution = rrspType === 'overcontribution';

  const bankReady = method === 'international_wire'
    ? intlWire.bankName && intlWire.swiftCode
    : selectedBank;

  const canContinueDeregistration = currency && parsedAmount > 0 && !exceedsAvailable && method && bankReady;
  const canContinueHBP =
    currency && parsedAmount > 0 && !exceedsAvailable && method && bankReady && confirmChecked && (
      (hbpFormChoice === 'fillhere' && hbpEligible === true && address.street && address.city && signed)
      || (hbpFormChoice === 'upload' && hbpUploadedFile)
    );
  const canContinueLLP =
    currency && parsedAmount > 0 && !exceedsAvailable && method && bankReady && confirmChecked && (
      (llpFormChoice === 'fillhere' && llpEligible && signed)
      || (llpFormChoice === 'upload' && llpUploadedFile)
    );
  

  function handleSubmit() {
    setSubmitted(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  if (submitted && account) {
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
              Your {isHBP ? "Home Buyer's Plan" : isLLP ? 'Lifelong Learning Plan' : isOvercontribution ? 'overcontribution' : 'deregistration'} withdrawal request has been submitted.
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

  return (
    <div className="min-h-screen flex flex-col bg-qt-white">
      <TopNav showExit onExit={() => navigate('/')} />
      {showSummary && account && renderSummary()}
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
                <WithdrawalTypeDropdown
                  value={rrspType}
                  onChange={(v) => {
                    setRrspType(v);
                    setCurrency(null);
                    setAmount('');
                    setMethod(null);
                    setSelectedBank(null);
                    setGrossAmount(0);
                    setHbpFormChoice(null);
                    setHbpUploadedFile(null);
                    setHbpEligible(null);
                    setLlpFormChoice(null);
                    setLlpUploadedFile(null);
                    setLlpEligible(false);
                    setLlpData({});
                    setOvpFormMailed(false);
                    setSigned(false);
                    setConfirmChecked(false);
                  }}
                />
              </section>
            </WizardSection>

            {/* HBP max info */}
            <WizardSection visible={isHBP}>
              <InfoBox>
                <p>
                  Under the Home Buyers' Plan, you can withdraw a maximum of <strong>$60,000 CAD</strong> from
                  your RRSP to buy or build a qualifying home.
                </p>
              </InfoBox>
            </WizardSection>

            {/* LLP max info */}
            <WizardSection visible={isLLP}>
              <InfoBox>
                <p>
                  Under the Lifelong Learning Plan, you can withdraw a maximum of <strong>$20,000 CAD</strong> total
                  and up to <strong>$10,000 CAD</strong> within a calendar year from your RRSP to finance
                  full-time education or training for you or your spouse.
                </p>
              </InfoBox>
            </WizardSection>

            {/* Currency Selection - combined amounts */}
            <WizardSection visible={!!rrspType && !isOvercontribution}>
              <section>
                <CurrencySelector
                  value={currency}
                  onChange={(c) => { setCurrency(c); setAmount(''); setGrossAmount(0); }}
                  cadAmount={combinedCad}
                  usdAmount={combinedUsd}
                />
              </section>
            </WizardSection>

            {/* Deregistration: Calculator + withdrawal amount */}
            <WizardSection visible={isDeregistration && !!currency}>
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
                    {triggersConversion && (
                      <p className="text-sm text-amber-800 mt-2">
                        Your request exceeds your {currency} balance. An automatic currency conversion will be applied to cover the difference.
                      </p>
                    )}
                  </div>
                )}
              </section>
            </WizardSection>

            {/* HBP: Gross amount */}
            <WizardSection visible={isHBP && !!currency}>
              <section>
                <CurrencyInput
                  label="Gross withdrawal amount"
                  value={amount}
                  onChange={setAmount}
                  max={60000}
                  maxLabel="$60,000.00 CAD"
                  error={exceedsAvailable ? `Amount exceeds available balance of ${formatCurrency(maxAmount, currency!)}` : undefined}
                />
                {!exceedsAvailable && (
                  <p className="text-xs text-qt-secondary mt-1">Maximum: $60,000.00 CAD</p>
                )}
                {triggersConversion && (
                  <div className="mt-3 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3">
                    <p className="text-sm text-amber-800">Your request exceeds your {currency} balance. An automatic currency conversion will be applied to cover the difference.</p>
                  </div>
                )}
              </section>
            </WizardSection>

            {/* Overcontribution: Instructions only — no submission */}
            <WizardSection visible={isOvercontribution}>
              <section className="flex flex-col gap-5">
                <InfoBox>
                  <div className="flex flex-col gap-3">
                    <p className="font-semibold">How to withdraw RRSP overcontributions</p>
                    <p>
                      To remove excess contributions from your RRSP, you'll need to complete the CRA's <strong>T3012A — Tax Deduction Waiver on the Refund of Your Undeducted RRSP, PRPP, or SPP Contributions</strong> form.
                    </p>
                    <p>Here's what to do:</p>
                    <ol className="list-decimal ml-5 flex flex-col gap-1.5 text-sm">
                      <li>Download and complete the <strong>T3012A</strong> form from the CRA website.</li>
                      <li>Submit the form to the <strong>CRA</strong> for approval and their signature.</li>
                      <li>Once you receive the CRA-approved form, mail it to Questrade at the address below.</li>
                    </ol>
                    <div className="bg-white/60 rounded-md p-3 mt-1">
                      <p className="text-sm font-semibold text-qt-primary mb-1">Mail to:</p>
                      <p className="text-sm text-qt-primary leading-relaxed">
                        Questrade Inc.<br />
                        5700 Yonge Street, Suite 1700<br />
                        Toronto, ON M2M 4K2
                      </p>
                    </div>
                    <a
                      href="https://www.canada.ca/en/revenue-agency/services/forms-publications/forms/t3012a.html"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-sm font-semibold text-qt-green-dark hover:underline mt-1"
                    >
                      Download T3012A form from Canada.ca &rarr;
                    </a>
                  </div>
                </InfoBox>

                <div className="border border-qt-border rounded-lg p-5 bg-qt-bg-3">
                  <p className="text-sm text-qt-primary leading-relaxed">
                    Once we receive your CRA-approved T3012A form in the mail, we'll process the withdrawal on your behalf and notify you by email. No further action is needed from you online.
                  </p>
                </div>

                <Button variant="secondary" onClick={() => navigate('/')}>
                  Return to accounts
                </Button>
              </section>
            </WizardSection>

            {/* LLP: Gross amount */}
            <WizardSection visible={isLLP && !!currency}>
              <section>
                <CurrencyInput
                  label="Gross withdrawal amount"
                  value={amount}
                  onChange={setAmount}
                  max={10000}
                  maxLabel="$10,000.00 CAD per calendar year"
                  error={exceedsAvailable ? `Amount exceeds available balance of ${formatCurrency(maxAmount, currency!)}` : undefined}
                />
                {!exceedsAvailable && (
                  <p className="text-xs text-qt-secondary mt-1">Maximum: $10,000.00 CAD per calendar year &middot; $20,000.00 CAD lifetime</p>
                )}
                {triggersConversion && (
                  <div className="mt-3 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3">
                    <p className="text-sm text-amber-800">Your request exceeds your {currency} balance. An automatic currency conversion will be applied to cover the difference.</p>
                  </div>
                )}
              </section>
            </WizardSection>

            {/* Method */}
            <WizardSection visible={!isOvercontribution && parsedAmount > 0 && !exceedsAvailable}>
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

            {/* HBP Form Choice */}
            <WizardSection visible={isHBP && !!bankReady}>
              <section className="flex flex-col gap-4">
                <div>
                  <p className="font-semibold text-sm text-qt-primary mb-1">T1036 — Home Buyers' Plan form</p>
                  <p className="text-sm text-qt-secondary leading-relaxed">
                    To meet government requirements, we need a completed T1036 form to process your request. Tell us how you'd like to complete your withdrawal form.
                  </p>
                </div>
                <button type="button" onClick={() => { setHbpFormChoice('fillhere'); setHbpUploadedFile(null); }}
                  className={`w-full rounded-lg border-2 p-5 text-left transition-all cursor-pointer ${hbpFormChoice === 'fillhere' ? 'border-qt-green bg-qt-green-bg/30' : 'border-qt-border hover:border-qt-gray-dark bg-white'}`}>
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-semibold text-sm text-qt-primary">Fill it out here</p>
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-qt-green text-white leading-none">Recommended</span>
                  </div>
                  <p className="text-sm text-qt-secondary leading-relaxed">Answer a few questions and we'll generate the form for you. Estimated time to complete: 2 minutes.</p>
                </button>
                <button type="button" onClick={() => { setHbpFormChoice('upload'); setHbpEligible(null); }}
                  className={`w-full rounded-lg border-2 p-5 text-left transition-all cursor-pointer ${hbpFormChoice === 'upload' ? 'border-qt-green bg-qt-green-bg/30' : 'border-qt-border hover:border-qt-gray-dark bg-white'}`}>
                  <p className="font-semibold text-sm text-qt-primary mb-1">Upload a completed form</p>
                  <p className="text-sm text-qt-secondary leading-relaxed">Download, sign, and upload your document manually.</p>
                  <a href="https://www.canada.ca/en/revenue-agency/services/forms-publications/forms/t1036.html" target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}
                    className="inline-flex items-center gap-1 text-sm font-semibold text-qt-green-dark hover:underline mt-2">
                    Download T1036 from Canada.ca &rarr;
                  </a>
                </button>
              </section>
            </WizardSection>

            {/* HBP Upload */}
            <WizardSection visible={isHBP && hbpFormChoice === 'upload'}>
              <section className="flex flex-col gap-4">
                <p className="font-semibold text-sm text-qt-primary">Upload your completed T1036 form</p>
                <div className="border-2 border-dashed border-qt-border rounded-lg p-8 text-center hover:border-qt-gray-dark transition-colors cursor-pointer"
                  onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                  onDrop={(e) => { e.preventDefault(); e.stopPropagation(); if (e.dataTransfer.files?.[0]) setHbpUploadedFile(e.dataTransfer.files[0]); }}
                  onClick={() => document.getElementById('hbp-upload')?.click()}>
                  <input id="hbp-upload" type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden"
                    onChange={(e) => { if (e.target.files?.[0]) setHbpUploadedFile(e.target.files[0]); }} />
                  {hbpUploadedFile ? (
                    <div className="flex flex-col items-center gap-2">
                      <CheckCircle2 size={24} className="text-qt-green" />
                      <p className="text-sm font-semibold text-qt-primary">{hbpUploadedFile.name}</p>
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

            {/* HBP Eligibility (fill here) */}
            <WizardSection visible={isHBP && hbpFormChoice === 'fillhere'}>
              <section>
                <HBPEligibility onEligibilityChange={setHbpEligible} />
              </section>
            </WizardSection>

            {/* HBP Address (fill here) */}
            <WizardSection visible={isHBP && hbpFormChoice === 'fillhere' && hbpEligible === true}>
              <section>
                <AddressInput value={address} onChange={setAddress} />
              </section>
            </WizardSection>

            {/* HBP E-sign + confirmation */}
            <WizardSection visible={isHBP && ((hbpFormChoice === 'fillhere' && hbpEligible === true && !!address.street) || (hbpFormChoice === 'upload' && !!hbpUploadedFile))}>
              <section className="flex flex-col gap-6">
                {method !== 'international_wire' && (
                  <ESignature onSign={() => setSigned(true)} signed={signed} />
                )}
                <div className="border border-qt-border rounded-lg p-5 bg-qt-bg-3">
                  <p className="text-sm text-qt-primary leading-[22px] mb-4">
                    I certify that the information I've provided is correct and complete, and I authorize this withdrawal from my RRSP.
                  </p>
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input type="checkbox" checked={confirmChecked} onChange={(e) => setConfirmChecked(e.target.checked)}
                      className="mt-1 size-4 accent-qt-green cursor-pointer" />
                    <span className="text-sm font-semibold text-qt-primary leading-[22px]">I agree</span>
                  </label>
                </div>
              </section>
            </WizardSection>

            {/* Continue - Deregistration */}
            <WizardSection visible={isDeregistration && !!canContinueDeregistration}>
              <div className="flex gap-3 pt-2 border-t border-qt-border">
                <Button variant="secondary" onClick={() => navigate('/')}>Cancel</Button>
                <Button onClick={() => { setShowSummary(true); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
                  Continue
                </Button>
              </div>
            </WizardSection>

            {/* Continue - HBP */}
            <WizardSection visible={isHBP && !!canContinueHBP}>
              <div className="flex gap-3 pt-2 border-t border-qt-border">
                <Button variant="secondary" onClick={() => navigate('/')}>Cancel</Button>
                <Button onClick={() => { setShowSummary(true); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
                  Continue
                </Button>
              </div>
            </WizardSection>

            {/* LLP Form Choice */}
            <WizardSection visible={isLLP && !!bankReady}>
              <section className="flex flex-col gap-4">
                <div>
                  <p className="font-semibold text-sm text-qt-primary mb-1">RC96 — Lifelong Learning Plan form</p>
                  <p className="text-sm text-qt-secondary leading-relaxed">
                    To meet government requirements, we need a completed RC96 form to process your request. Tell us how you'd like to complete your withdrawal form.
                  </p>
                </div>
                <button type="button" onClick={() => { setLlpFormChoice('fillhere'); setLlpUploadedFile(null); }}
                  className={`w-full rounded-lg border-2 p-5 text-left transition-all cursor-pointer ${llpFormChoice === 'fillhere' ? 'border-qt-green bg-qt-green-bg/30' : 'border-qt-border hover:border-qt-gray-dark bg-white'}`}>
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-semibold text-sm text-qt-primary">Fill it out here</p>
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-qt-green text-white leading-none">Recommended</span>
                  </div>
                  <p className="text-sm text-qt-secondary leading-relaxed">Answer a few questions and we'll generate the form for you. Estimated time to complete: 2 minutes.</p>
                </button>
                <button type="button" onClick={() => { setLlpFormChoice('upload'); setLlpEligible(false); setLlpData({}); }}
                  className={`w-full rounded-lg border-2 p-5 text-left transition-all cursor-pointer ${llpFormChoice === 'upload' ? 'border-qt-green bg-qt-green-bg/30' : 'border-qt-border hover:border-qt-gray-dark bg-white'}`}>
                  <p className="font-semibold text-sm text-qt-primary mb-1">Upload a completed form</p>
                  <p className="text-sm text-qt-secondary leading-relaxed">Download, sign, and upload your document manually.</p>
                  <a href="https://www.canada.ca/en/revenue-agency/services/forms-publications/forms/rc96.html" target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}
                    className="inline-flex items-center gap-1 text-sm font-semibold text-qt-green-dark hover:underline mt-2">
                    Download RC96 from Canada.ca &rarr;
                  </a>
                </button>
              </section>
            </WizardSection>

            {/* LLP Upload */}
            <WizardSection visible={isLLP && llpFormChoice === 'upload'}>
              <section className="flex flex-col gap-4">
                <p className="font-semibold text-sm text-qt-primary">Upload your completed RC96 form</p>
                <div className="border-2 border-dashed border-qt-border rounded-lg p-8 text-center hover:border-qt-gray-dark transition-colors cursor-pointer"
                  onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                  onDrop={(e) => { e.preventDefault(); e.stopPropagation(); if (e.dataTransfer.files?.[0]) setLlpUploadedFile(e.dataTransfer.files[0]); }}
                  onClick={() => document.getElementById('llp-upload')?.click()}>
                  <input id="llp-upload" type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden"
                    onChange={(e) => { if (e.target.files?.[0]) setLlpUploadedFile(e.target.files[0]); }} />
                  {llpUploadedFile ? (
                    <div className="flex flex-col items-center gap-2">
                      <CheckCircle2 size={24} className="text-qt-green" />
                      <p className="text-sm font-semibold text-qt-primary">{llpUploadedFile.name}</p>
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

            {/* LLP Eligibility (fill here) */}
            <WizardSection visible={isLLP && llpFormChoice === 'fillhere'}>
              <section>
                <LLPEligibility
                  onComplete={(elig, data) => { setLlpEligible(elig); setLlpData(data as unknown as Record<string, unknown>); }}
                  withdrawalAmount={amount}
                  onWithdrawalAmountChange={setAmount}
                />
              </section>
            </WizardSection>

            {/* LLP E-sign + confirmation */}
            <WizardSection visible={isLLP && ((llpFormChoice === 'fillhere' && llpEligible) || (llpFormChoice === 'upload' && !!llpUploadedFile))}>
              <section className="flex flex-col gap-6">
                {method !== 'international_wire' && (
                  <ESignature onSign={() => setSigned(true)} signed={signed} />
                )}
                <div className="border border-qt-border rounded-lg p-5 bg-qt-bg-3">
                  <p className="text-sm text-qt-primary leading-[22px] mb-4">
                    I certify that the information I've provided is correct and complete, and I authorize this withdrawal from my RRSP.
                  </p>
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input type="checkbox" checked={confirmChecked} onChange={(e) => setConfirmChecked(e.target.checked)}
                      className="mt-1 size-4 accent-qt-green cursor-pointer" />
                    <span className="text-sm font-semibold text-qt-primary leading-[22px]">I agree</span>
                  </label>
                </div>
              </section>
            </WizardSection>

            {/* Continue - LLP */}
            <WizardSection visible={isLLP && !!canContinueLLP}>
              <div className="flex gap-3 pt-2 border-t border-qt-border">
                <Button variant="secondary" onClick={() => navigate('/')}>Cancel</Button>
                <Button onClick={() => { setShowSummary(true); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
                  Continue
                </Button>
              </div>
            </WizardSection>

            
          </div>
        </div>
      </main>
    </div>
  );

  function renderSummary() {
    if (!account) return null;
    const bank = allBanks.find((b) => b.id === selectedBank);
    const withholdingTax = isDeregistration
      ? (parsedAmount <= 5000 ? parsedAmount * 0.1 : parsedAmount <= 15000 ? parsedAmount * 0.2 : parsedAmount * 0.3)
      : 0;
    const net = parsedAmount - withholdingTax - fee;

    const withdrawalTypeLabel = isHBP
      ? "Home Buyer's Plan"
      : isLLP
        ? 'Lifelong Learning Plan'
        : isOvercontribution
          ? 'Overcontribution'
          : 'Deregistration (Retirement or Another Reason)';

    const llpStudent = llpData.student === 'spouse'
      ? `${llpData.spouseFirstName || ''} ${llpData.spouseLastName || ''}`.trim()
      : `${llpData.firstName || 'Anastasia'} ${llpData.lastName || 'Carmichael'} (You)`;

    return (
      <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 overflow-y-auto" onClick={() => setShowSummary(false)}>
        <div className="w-full max-w-[680px] mx-auto bg-white rounded-2xl shadow-2xl my-10" onClick={(e) => e.stopPropagation()}>
          <div className="px-6 py-6 border-b border-qt-border flex items-center justify-between">
            <h2 className="font-display text-[22px] leading-[30px] text-qt-primary">
              Review & confirm
            </h2>
            <button type="button" onClick={() => setShowSummary(false)} className="text-qt-secondary hover:text-qt-primary text-sm font-semibold cursor-pointer">Close</button>
          </div>
          <div className="px-6 py-6">

            {isHBP && (
              <div className="bg-white border border-qt-border rounded-lg divide-y divide-qt-border mb-6">
                <SummaryRow label="Legal name" value="Anastasia Carmichael" />
                <SummaryRow label="Address of qualifying home" value={`${address.street}, ${address.city}, ${address.province} ${address.postalCode}`} />
              </div>
            )}

            {isLLP && (
              <div className="bg-white border border-qt-border rounded-lg divide-y divide-qt-border mb-6">
                <SummaryRow label="Account holder" value="Anastasia Carmichael" />
                <SummaryRow label="LLP student" value={llpStudent} />
              </div>
            )}

            <div className="bg-white border border-qt-border rounded-lg divide-y divide-qt-border mb-6">
              <SummaryRow label="Account" value={`${account.label} - ${account.accountNumber}`} />
              <SummaryRow label="Withdrawal type" value={withdrawalTypeLabel} />
              <SummaryRow label="Currency" value={currency || ''} />
              <SummaryRow label="Withdrawal amount" value={formatCurrency(parsedAmount, currency || 'CAD')} />
              {isDeregistration && (
                <SummaryRow label="Withholding tax" value={`-${formatCurrency(withholdingTax, currency || 'CAD')}`} tooltip="Questrade must make this tax payment to the CRA on your behalf" />
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
                <p className="font-semibold text-base text-qt-primary">Withdrawal amount requested</p>
                <p className="font-semibold text-lg text-qt-green-dark">{formatCurrency(Math.max(0, net), currency || 'CAD')}</p>
              </div>
            </div>

            {isHBP && hbpFormChoice === 'fillhere' && (
              <div className="mb-6">
                <button className="flex items-center gap-2 text-sm font-semibold text-qt-green-dark hover:underline cursor-pointer">
                  <Download size={16} /> Download pre-filled T1036 form
                </button>
                <p className="text-xs text-qt-secondary mt-2">A copy will also be emailed to you.</p>
              </div>
            )}
            {isHBP && hbpFormChoice === 'upload' && hbpUploadedFile && (
              <div className="bg-qt-bg-3 border border-qt-border rounded-lg p-4 mb-6">
                <p className="text-sm text-qt-primary">
                  <CheckCircle2 size={16} className="inline text-qt-green mr-1.5 -mt-0.5" />
                  T1036 form uploaded: <span className="font-semibold">{hbpUploadedFile.name}</span>
                </p>
              </div>
            )}

            {isLLP && llpFormChoice === 'fillhere' && (
              <div className="mb-6">
                <button className="flex items-center gap-2 text-sm font-semibold text-qt-green-dark hover:underline cursor-pointer">
                  <Download size={16} /> Download pre-filled RC96 form
                </button>
                <p className="text-xs text-qt-secondary mt-2">A copy will also be emailed to you.</p>
              </div>
            )}
            {isLLP && llpFormChoice === 'upload' && llpUploadedFile && (
              <div className="bg-qt-bg-3 border border-qt-border rounded-lg p-4 mb-6">
                <p className="text-sm text-qt-primary">
                  <CheckCircle2 size={16} className="inline text-qt-green mr-1.5 -mt-0.5" />
                  RC96 form uploaded: <span className="font-semibold">{llpUploadedFile.name}</span>
                </p>
              </div>
            )}

            <div className="flex gap-3">
              <Button variant="secondary" onClick={() => setShowSummary(false)}>Back</Button>
              <Button onClick={handleSubmit}>Submit withdrawal</Button>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

function WithdrawalTypeDropdown({
  value,
  onChange,
}: {
  value: RRSPWithdrawalType | '';
  onChange: (v: RRSPWithdrawalType) => void;
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

  const selected = rrspOptions.find((o) => o.value === value);

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
          {rrspOptions.map((opt) => (
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
