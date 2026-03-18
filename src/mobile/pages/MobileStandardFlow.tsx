import { useState, useRef } from 'react';
import { CheckCircle2 } from 'lucide-react';
import MobileAccountDropdown from '../components/MobileAccountDropdown';
import MobileBalanceCard from '../components/MobileBalanceCard';
import MobileCurrencySelector from '../components/MobileCurrencySelector';
import MobileCurrencyInput from '../components/MobileCurrencyInput';
import MobileMethodSelector from '../components/MobileMethodSelector';
import MobileBankSelector from '../components/MobileBankSelector';
import MobileInternationalWireForm from '../components/MobileInternationalWireForm';
import MobileESignature from '../components/MobileESignature';
import MobileButton from '../components/MobileButton';
import MobileWizardSection from '../components/MobileWizardSection';
import { linkedBanks as defaultBanks, formatCurrency, FX_RATE, FX_BUFFER } from '../../data/accounts';
import type { Account, Currency, WithdrawalMethod, LinkedBank, InternationalWireData } from '../../types';

export default function MobileStandardFlow() {
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
    routingNumber: '',
    isBrokerage: false,
    brokerageName: '',
    brokerageAccountName: '',
    brokerageAccountNumber: '',
  });
  const [signed, setSigned] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const isRegisteredAccount = account && ['RRSP', 'FHSA', 'RESP'].includes(account.type);

  function handleAccountChange(acct: Account) {
    if (acct.type === 'RRSP' || acct.type === 'FHSA' || acct.type === 'RESP') {
      setAccount(acct);
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
  const combinedCad = cadAvailable + usdAvailable * FX_RATE * (1 - FX_BUFFER);
  const combinedUsd = cadAvailable / FX_RATE * (1 - FX_BUFFER) + usdAvailable;
  const maxAmount = currency === 'CAD' ? combinedCad : currency === 'USD' ? combinedUsd : 0;
  const parsedAmount = parseFloat(amount) || 0;
  const exceedsAvailable = parsedAmount > maxAmount && parsedAmount > 0;
  const singleCurrencyBalance = currency === 'CAD' ? cadAvailable : currency === 'USD' ? usdAvailable : 0;
  const triggersConversion = parsedAmount > singleCurrencyBalance && !exceedsAvailable && parsedAmount > 0;
  const fee = method === 'wire' ? (currency === 'USD' ? 30 : 20) : method === 'international_wire' ? 40 : 0;
  const netAmount = parsedAmount - fee;

  const canContinue =
    !isRegisteredAccount &&
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
      <div className="flex flex-col min-h-0 px-4 py-8">
        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="max-w-[375px] w-full text-center">
            <div className="size-20 rounded-full bg-qt-green-bg flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 size={40} className="text-qt-green" />
            </div>
            <h2 className="font-display text-2xl leading-tight text-qt-primary mb-3">
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
            <MobileButton
              onClick={() => {
                setSubmitted(false);
                setAccount(null);
                setCurrency(null);
                setAmount('');
                setMethod(null);
                setSelectedBank(null);
                setSigned(false);
                setShowSummary(false);
              }}
            >
              Start new withdrawal
            </MobileButton>
          </div>
        </div>
      </div>
    );
  }

  const summaryModal = showSummary && account ? (() => {
    const bank = allBanks.find((b) => b.id === selectedBank);
    return (
      <div
        className="fixed inset-0 z-50 flex flex-col items-center justify-end bg-black/50 max-w-[430px] mx-auto"
        onClick={() => setShowSummary(false)}
      >
        <div
          className="w-full bg-white rounded-t-2xl shadow-2xl max-h-[85vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="sticky top-0 bg-white px-4 py-4 border-b border-qt-border flex items-center justify-between">
            <h2 className="font-display text-xl leading-tight text-qt-primary">Review & confirm</h2>
            <button
              type="button"
              onClick={() => setShowSummary(false)}
              className="min-h-[44px] min-w-[44px] flex items-center justify-center text-qt-secondary active:text-qt-primary text-sm font-semibold cursor-pointer"
            >
              Close
            </button>
          </div>
          <div className="px-4 py-6">
            <div className="bg-white border-2 border-qt-border rounded-xl divide-y divide-qt-border mb-6">
              <MobileSummaryRow label="Account" value={`${account.label} - ${account.accountNumber}`} />
              <MobileSummaryRow label="Currency" value={currency || ''} />
              <MobileSummaryRow label="Withdrawal amount" value={formatCurrency(parsedAmount, currency || 'CAD')} />
              <MobileSummaryRow label="Method" value={method === 'eft' ? 'EFT' : method === 'wire' ? 'Wire Transfer' : 'International Wire'} />
              {fee > 0 && <MobileSummaryRow label="Fee" value={`-${formatCurrency(fee, currency || 'CAD')}`} />}
              {method !== 'international_wire' && bank && (
                <MobileSummaryRow label="Bank" value={`${bank.name} - ****${bank.last4}`} />
              )}
              {method === 'international_wire' && (
                <>
                  <MobileSummaryRow label="International bank" value={intlWire.bankName} />
                  <MobileSummaryRow label="SWIFT code" value={intlWire.swiftCode} />
                  {intlWire.reason && <MobileSummaryRow label="Reason" value={intlWire.reason} />}
                </>
              )}
              <div className="flex items-center justify-between px-4 py-4 bg-qt-bg-3">
                <p className="font-semibold text-base text-qt-primary">Withdrawal amount requested</p>
                <p className="font-semibold text-lg text-qt-green-dark">{formatCurrency(Math.max(0, netAmount), currency || 'CAD')}</p>
              </div>
              {((currency === 'CAD' && parsedAmount > 50000) || (currency === 'USD' && parsedAmount > 25000)) && (
                <div className="px-4 py-3 bg-amber-50 border-t border-amber-300">
                  <p className="text-sm text-amber-800">This amount is more than $50k CAD or $25k USD, so it will be processed in multiple withdrawals.</p>
                </div>
              )}
            </div>
            <div className="flex flex-col gap-3">
              <MobileButton variant="secondary" onClick={() => setShowSummary(false)}>
                Back
              </MobileButton>
              <MobileButton onClick={handleSubmit}>
                Submit withdrawal
              </MobileButton>
            </div>
          </div>
        </div>
      </div>
    );
  })() : null;

  return (
    <div className="flex flex-col min-h-0">
      {summaryModal}
      <div className="flex-1 px-4 py-6 pb-12">
        <h1 className="font-display text-2xl leading-tight text-qt-primary mb-6">
          Withdraw funds
        </h1>

        <div className="flex flex-col gap-8">
          <section>
            <MobileAccountDropdown value={account?.id || null} onChange={handleAccountChange} />
          </section>

          {isRegisteredAccount && (
            <div className="rounded-xl border-2 border-amber-300 bg-amber-50 p-4">
              <p className="text-sm text-amber-800">
                RRSP, FHSA, and RESP withdrawals with special tax forms are available on the full web experience. Please visit Questrade on your computer to complete these withdrawals.
              </p>
            </div>
          )}

          <MobileWizardSection visible={!!account && !isRegisteredAccount}>
            <section>
              {account && <MobileBalanceCard account={account} />}
            </section>
          </MobileWizardSection>

          <MobileWizardSection visible={!!account && !isRegisteredAccount}>
            <section>
              <MobileCurrencySelector
                value={currency}
                onChange={(c) => { setCurrency(c); setAmount(''); }}
                cadAmount={combinedCad}
                usdAmount={combinedUsd}
              />
            </section>
          </MobileWizardSection>

          <MobileWizardSection visible={!!currency}>
            <section>
              <MobileCurrencyInput
                label="Withdrawal amount"
                value={amount}
                onChange={setAmount}
                error={exceedsAvailable ? `Amount exceeds available balance of ${formatCurrency(maxAmount, currency!)}` : undefined}
              />
              {currency && !exceedsAvailable && (
                <p className="text-xs text-qt-secondary mt-2">
                  Available: {formatCurrency(maxAmount, currency)}
                </p>
              )}
              {triggersConversion && (
                <div className="mt-3 rounded-xl border-2 border-amber-300 bg-amber-50 px-4 py-3">
                  <p className="text-sm text-amber-800">
                    Your request exceeds your {currency} balance. An automatic currency conversion will be applied to cover the difference.
                  </p>
                </div>
              )}
            </section>
          </MobileWizardSection>

          <MobileWizardSection visible={parsedAmount > 0 && !exceedsAvailable}>
            <section>
              <MobileMethodSelector value={method} onChange={(m) => { setMethod(m); setSelectedBank(null); }} currency={currency} />
            </section>
          </MobileWizardSection>

          <MobileWizardSection visible={!!method && method !== 'international_wire'}>
            <section>
              <MobileBankSelector
                value={selectedBank}
                onChange={setSelectedBank}
                allBanks={allBanks}
                onBanksChange={setAllBanks}
              />
            </section>
          </MobileWizardSection>

          <MobileWizardSection visible={method === 'international_wire'}>
            <section>
              <MobileInternationalWireForm
                currency={currency || 'CAD'}
                amount={amount}
                data={intlWire}
                onChange={setIntlWire}
              />
              <div className="mt-6">
                <MobileESignature onSign={() => setSigned(true)} signed={signed} />
              </div>
            </section>
          </MobileWizardSection>

          <MobileWizardSection visible={!!canContinue}>
            <div className="flex flex-col gap-3 pt-4 border-t border-qt-border">
              <MobileButton
                variant="secondary"
                onClick={() => { setAccount(null); setCurrency(null); setAmount(''); setMethod(null); }}
              >
                Cancel
              </MobileButton>
              <MobileButton
                onClick={() => { setShowSummary(true); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              >
                Continue
              </MobileButton>
            </div>
          </MobileWizardSection>
        </div>
        <div ref={bottomRef} />
      </div>
    </div>
  );
}

function MobileSummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between px-4 py-4">
      <p className="text-sm text-qt-secondary">{label}</p>
      <p className="text-sm font-semibold text-qt-primary text-right max-w-[60%] break-words">{value}</p>
    </div>
  );
}
