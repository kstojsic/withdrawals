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
import WizardSection from '../components/WizardSection';
import { accounts, linkedBanks as defaultBanks, formatCurrency, FX_RATE } from '../data/accounts';
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
  const [qualifyingEligible, setQualifyingEligible] = useState(false);
  const [qualifyingData, setQualifyingData] = useState<Record<string, unknown>>({});
  const [ovpFormMailed, setOvpFormMailed] = useState(false);
  const [confirmChecked, setConfirmChecked] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [submitted, setSubmitted] = useState(false);

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
    setQualifyingEligible(false);
    setQualifyingData({});
    setOvpFormMailed(false);
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
  const fee = method === 'wire' ? 20 : method === 'international_wire' ? 40 : 0;

  const isQualifying = fhsaType === 'qualifying';
  const isNonQualifying = fhsaType === 'non_qualifying';
  const isOvercontribution = fhsaType === 'overcontribution';

  const bankReady = method === 'international_wire'
    ? intlWire.bankName && intlWire.swiftCode
    : selectedBank;

  const canContinueQualifying =
    currency && parsedAmount > 0 && !exceedsAvailable && method && bankReady && qualifyingEligible && confirmChecked;

  const canContinueNonQualifying =
    currency && parsedAmount > 0 && !exceedsAvailable && method && bankReady;

  const canContinueOvercontribution =
    currency && parsedAmount > 0 && !exceedsAvailable && method && bankReady && ovpFormMailed && confirmChecked;

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
                    setQualifyingEligible(false);
                    setQualifyingData({});
                    setOvpFormMailed(false);
                    setConfirmChecked(false);
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
                  onChange={setAmount}
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

            {/* Qualifying Eligibility */}
            <WizardSection visible={isQualifying && !!bankReady}>
              <section>
                <FHSAEligibility
                  onComplete={(elig, data) => { setQualifyingEligible(elig); setQualifyingData(data as unknown as Record<string, unknown>); }}
                  withdrawalAmount={amount}
                  onWithdrawalAmountChange={setAmount}
                />
              </section>
            </WizardSection>

            {/* Qualifying confirmation checkbox */}
            <WizardSection visible={isQualifying && qualifyingEligible}>
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

            {/* Overcontribution: T1-OVP + checkboxes */}
            <WizardSection visible={isOvercontribution && !!bankReady}>
              <section className="flex flex-col gap-6">
                <InfoBox variant="warning">
                  <div className="flex flex-col gap-2">
                    <p className="font-semibold">T1-OVP form required</p>
                    <p>
                      To process an overcontribution withdrawal, you must complete the following steps:
                    </p>
                    <ol className="list-decimal ml-5 flex flex-col gap-1 text-sm">
                      <li>Download and fill out the <strong>T1-OVP Individual Tax Return for RRSP, PRPP and SPP Excess Contributions</strong> form.</li>
                      <li>Send the completed form to the <strong>CRA</strong> for their signature.</li>
                      <li>Once you receive the CRA-signed form, sign it yourself.</li>
                      <li>Mail the fully signed form to Questrade.</li>
                    </ol>
                    <a
                      href="https://www.canada.ca/en/revenue-agency/services/forms-publications/forms/t1-ovp.html"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-sm font-semibold text-qt-green-dark hover:underline mt-1"
                    >
                      Download T1-OVP form &rarr;
                    </a>
                  </div>
                </InfoBox>

                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={ovpFormMailed}
                    onChange={(e) => setOvpFormMailed(e.target.checked)}
                    className="mt-1 size-4 accent-qt-green cursor-pointer"
                  />
                  <span className="text-sm text-qt-primary leading-[22px]">
                    I have mailed the signed T1-OVP form and it is on the way to Questrade
                  </span>
                </label>

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

            {isQualifying && (
              <div className="mb-6">
                <button className="flex items-center gap-2 text-sm font-semibold text-qt-green-dark hover:underline cursor-pointer">
                  <Download size={16} />
                  Download pre-filled RC725 form
                </button>
                <p className="text-xs text-qt-secondary mt-2">A copy will also be emailed to you.</p>
              </div>
            )}

            {isOvercontribution && (
              <div className="bg-qt-bg-3 border border-qt-border rounded-lg p-4 mb-6">
                <p className="text-sm text-qt-primary">
                  <CheckCircle2 size={16} className="inline text-qt-green mr-1.5 -mt-0.5" />
                  You've confirmed the signed T1-OVP form has been mailed to Questrade.
                </p>
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
