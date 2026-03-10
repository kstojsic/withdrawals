import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
import TopNav from '../components/TopNav';
import AccountDropdown from '../components/AccountDropdown';
import BalanceCard from '../components/BalanceCard';
import CurrencySelector from '../components/CurrencySelector';
import CurrencyInput from '../components/CurrencyInput';
import MethodSelector from '../components/MethodSelector';
import BankSelector from '../components/BankSelector';
import InternationalWireForm from '../components/InternationalWireForm';
import ESignature from '../components/ESignature';
import Button from '../components/Button';
import WizardSection from '../components/WizardSection';
import { linkedBanks as defaultBanks, formatCurrency, FX_RATE } from '../data/accounts';
import type { Account, Currency, WithdrawalMethod, LinkedBank, InternationalWireData } from '../types';

export default function StandardFlow() {
  const navigate = useNavigate();

  const [account, setAccount] = useState<Account | null>(null);
  const [currency, setCurrency] = useState<Currency | null>(null);
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
  const [showSummary, setShowSummary] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  function handleAccountChange(acct: Account) {
    if (acct.type === 'RRSP') {
      navigate('/withdraw/rrsp');
      return;
    }
    if (acct.type === 'FHSA') {
      navigate('/withdraw/fhsa');
      return;
    }
    if (acct.type === 'RESP') {
      navigate('/withdraw/resp');
      return;
    }
    setAccount(acct);
    setCurrency(null);
    setAmount('');
    setMethod(null);
    setSelectedBank(null);
    setSigned(false);
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
  const netAmount = parsedAmount - fee;

  const canContinue =
    currency &&
    parsedAmount > 0 &&
    !exceedsAvailable &&
    method &&
    (method === 'international_wire' ? intlWire.bankName && intlWire.swiftCode : selectedBank);

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
              Your withdrawal request of{' '}
              <strong className="text-qt-primary">
                {formatCurrency(parsedAmount, currency || 'CAD')}
              </strong>{' '}
              from your <strong className="text-qt-primary">{account.label}</strong> has been submitted.
            </p>
            <p className="text-sm text-qt-secondary leading-[22px] mb-8">
              Processing typically takes 1-3 business days. You'll receive a confirmation email shortly.
            </p>
            <Button onClick={() => { setSubmitted(false); setAccount(null); setCurrency(null); setAmount(''); setMethod(null); setSelectedBank(null); setSigned(false); setShowSummary(false); }}>
              Start new withdrawal
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const summaryModal = showSummary && account ? (() => {
    const bank = allBanks.find((b) => b.id === selectedBank);
    return (
      <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 overflow-y-auto" onClick={() => setShowSummary(false)}>
        <div className="w-full max-w-[680px] mx-auto bg-white rounded-2xl shadow-2xl my-10" onClick={(e) => e.stopPropagation()}>
          <div className="px-6 py-6 border-b border-qt-border flex items-center justify-between">
            <h2 className="font-display text-[22px] leading-[30px] text-qt-primary">Review & confirm</h2>
            <button type="button" onClick={() => setShowSummary(false)} className="text-qt-secondary hover:text-qt-primary text-sm font-semibold cursor-pointer">Close</button>
          </div>
          <div className="px-6 py-6">
            <div className="bg-white border border-qt-border rounded-lg divide-y divide-qt-border mb-6">
              <SummaryRow label="Account" value={`${account.label} - ${account.accountNumber}`} />
              <SummaryRow label="Currency" value={currency || ''} />
              <SummaryRow label="Withdrawal amount" value={formatCurrency(parsedAmount, currency || 'CAD')} />
              <SummaryRow label="Method" value={method === 'eft' ? 'EFT' : method === 'wire' ? 'Wire Transfer' : 'International Wire'} />
              {fee > 0 && <SummaryRow label="Fee" value={`-${formatCurrency(fee, currency || 'CAD')}`} />}
              {method !== 'international_wire' && bank && (
                <SummaryRow label="Bank" value={`${bank.name} - ****${bank.last4}`} />
              )}
              {method === 'international_wire' && (
                <>
                  <SummaryRow label="International bank" value={intlWire.bankName} />
                  <SummaryRow label="SWIFT code" value={intlWire.swiftCode} />
                  {intlWire.reason && <SummaryRow label="Reason" value={intlWire.reason} />}
                </>
              )}
              <div className="flex items-center justify-between px-5 py-4 bg-qt-bg-3">
                <p className="font-semibold text-base text-qt-primary">Withdrawal amount requested</p>
                <p className="font-semibold text-lg text-qt-green-dark">{formatCurrency(Math.max(0, netAmount), currency || 'CAD')}</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="secondary" onClick={() => setShowSummary(false)}>Back</Button>
              <Button onClick={handleSubmit}>Submit withdrawal</Button>
            </div>
          </div>
        </div>
      </div>
    );
  })() : null;

  return (
    <div className="min-h-screen flex flex-col bg-qt-white">
      <TopNav />
      {summaryModal}
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

            {/* Currency Selection - combined amounts */}
            <WizardSection visible={!!account}>
              <section>
                <CurrencySelector
                  value={currency}
                  onChange={(c) => { setCurrency(c); setAmount(''); }}
                  cadAmount={combinedCad}
                  usdAmount={combinedUsd}
                />
              </section>
            </WizardSection>

            {/* Amount */}
            <WizardSection visible={!!currency}>
              <section>
                <CurrencyInput
                  label="Withdrawal amount"
                  value={amount}
                  onChange={setAmount}
                  error={exceedsAvailable ? `Amount exceeds available balance of ${formatCurrency(maxAmount, currency!)}` : undefined}
                />
                {currency && !exceedsAvailable && (
                  <p className="text-xs text-qt-secondary mt-1">
                    Available: {formatCurrency(maxAmount, currency)}
                  </p>
                )}
                {triggersConversion && (
                  <div className="mt-3 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3">
                    <p className="text-sm text-amber-800">
                      Your request exceeds your {currency} balance. An automatic currency conversion will be applied to cover the difference.
                    </p>
                  </div>
                )}
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

            {/* International Wire Form */}
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

            {/* Continue */}
            <WizardSection visible={!!canContinue}>
              <div className="flex gap-3 pt-2 border-t border-qt-border">
                <Button variant="secondary" onClick={() => { setAccount(null); setCurrency(null); setAmount(''); setMethod(null); }}>Cancel</Button>
                <Button onClick={() => { setShowSummary(true); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
                  Continue
                </Button>
              </div>
            </WizardSection>
          </div>
          <div ref={bottomRef} />
        </div>
      </main>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between px-5 py-4">
      <p className="text-sm text-qt-secondary">{label}</p>
      <p className="text-sm font-semibold text-qt-primary">{value}</p>
    </div>
  );
}
