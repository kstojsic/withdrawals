import { useId, useState } from 'react';
import { X, Building2, ChevronRight, Upload, CheckCircle2, Globe } from 'lucide-react';
import type { LinkedBank, Currency, InternationalWireData } from '../../types';
import { bankOptions } from '../../data/accounts';
import { emptyInternationalWireData, hasInternationalLinkComplete } from '../../lib/internationalWire';
import MobileInputField from './MobileInputField';
import MobileButton from './MobileButton';
import MobileESignature from './MobileESignature';
import MobileInternationalWireFormBody from './MobileInternationalWireFormBody';
import MobileZumConnectFlow from './MobileZumConnectFlow';
import MobileZumManualSuccess from './zum/MobileZumManualSuccess';
import {
  manualCurrencyBtnBase,
  manualHelperText,
  manualSectionBox,
  manualSectionTitle,
  manualSelectClass,
  manualUploadZoneClass,
} from '../../lib/adsLinkBankSectionStyles';

interface MobileLinkBankModalProps {
  onClose: () => void;
  onSave: (bank: LinkedBank) => void;
}

type LinkMode = 'choose' | 'manual' | 'international' | 'manual_success';

export default function MobileLinkBankModal({ onClose, onSave }: MobileLinkBankModalProps) {
  const intlFormId = useId();
  const manualHolderRadioName = useId();
  const [mode, setMode] = useState<LinkMode>('choose');
  const [zumFlow, setZumFlow] = useState(false);
  const [pendingManualBank, setPendingManualBank] = useState<LinkedBank | null>(null);
  const [selectedBank, setSelectedBank] = useState('');
  const [transit, setTransit] = useState('');
  const [accountNum, setAccountNum] = useState('');
  const [voidCheque, setVoidCheque] = useState<File | null>(null);
  const [depositCurrency, setDepositCurrency] = useState<Currency>('CAD');
  const [manualAccountHolderType, setManualAccountHolderType] = useState<'personal' | 'corporate'>('personal');

  const [intlWire, setIntlWire] = useState<InternationalWireData>(() => emptyInternationalWireData());
  const [intlSigned, setIntlSigned] = useState(false);

  function submitManualLink() {
    const bankInfo = bankOptions.find((b) => b.value === selectedBank);
    const newBank: LinkedBank = {
      id: `new-${Date.now()}`,
      name: bankInfo?.label || 'New Bank',
      institutionNumber: bankInfo?.institution || '',
      transitNumber: transit,
      accountNumber: accountNum,
      last4: accountNum.slice(-4),
      depositCurrency,
      institutionCountry: 'CA',
      accountHolderType: manualAccountHolderType,
    };
    setPendingManualBank(newBank);
    setMode('manual_success');
  }

  function handleSaveInternational() {
    if (!hasInternationalLinkComplete(intlWire, intlSigned)) return;
    const acct = intlWire.bankAccountNumber.trim();
    const newBank: LinkedBank = {
      id: `new-${Date.now()}`,
      name: intlWire.bankName.trim(),
      institutionNumber: '',
      transitNumber: '',
      accountNumber: acct,
      last4: acct.length >= 4 ? acct.slice(-4) : acct,
      depositCurrency: intlWire.currency,
      institutionCountry: 'INTL',
      swiftCode: intlWire.swiftCode.trim(),
      internationalWire: { ...intlWire },
    };
    onSave(newBank);
  }

  const intlFormValid = hasInternationalLinkComplete(intlWire, intlSigned);

  if (zumFlow) {
    return (
      <MobileZumConnectFlow
        onComplete={(bank) => {
          onSave(bank);
        }}
        onExit={() => setZumFlow(false)}
      />
    );
  }

  if (mode === 'manual_success' && pendingManualBank) {
    return (
      <MobileZumManualSuccess
        onContinue={() => {
          onSave(pendingManualBank);
          setPendingManualBank(null);
        }}
        onClose={() => {
          setPendingManualBank(null);
          setMode('manual');
        }}
      />
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center">
      <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full max-w-[min(100%,var(--mobile-layout-max-width))] max-h-[90vh] overflow-y-auto font-[family-name:var(--font-body)]">
        <div className="flex items-center justify-between px-4 py-4 border-b border-qt-border sticky top-0 bg-white">
          <h3 className="text-xl font-semibold text-qt-primary">Connect bank account</h3>
          <button onClick={onClose} className="min-h-[44px] min-w-[44px] flex items-center justify-center text-qt-secondary active:text-qt-primary cursor-pointer">
            <X size={24} />
          </button>
        </div>

        <div className="p-4">
          {mode === 'choose' && (
            <div className="flex flex-col gap-3">
              <button
                type="button"
                onClick={() => setZumFlow(true)}
                className="min-h-[72px] flex items-center gap-4 p-4 rounded-xl border-2 border-qt-border active:border-qt-green transition-all cursor-pointer text-left w-full"
              >
                <div className="size-12 rounded-xl bg-qt-green-bg flex items-center justify-center shrink-0">
                  <Building2 size={20} className="text-qt-green-dark" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-sm text-qt-primary">Connect automatically</p>
                  <p className="text-xs text-qt-secondary">Securely link your bank using online banking credentials</p>
                </div>
                <ChevronRight size={20} className="text-qt-gray-dark" />
              </button>
              <button
                type="button"
                onClick={() => setMode('manual')}
                className="min-h-[72px] flex items-center gap-4 p-4 rounded-xl border-2 border-qt-border active:border-qt-green transition-all cursor-pointer text-left w-full"
              >
                <div className="size-12 rounded-xl bg-qt-bg-3 flex items-center justify-center shrink-0">
                  <Building2 size={20} className="text-qt-secondary" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-sm text-qt-primary">Enter manually</p>
                  <p className="text-xs text-qt-secondary">Enter your institution, transit, and account number</p>
                </div>
                <ChevronRight size={20} className="text-qt-gray-dark" />
              </button>
              <button
                type="button"
                onClick={() => {
                  setIntlWire(emptyInternationalWireData());
                  setIntlSigned(false);
                  setMode('international');
                }}
                className="min-h-[72px] flex items-center gap-4 p-4 rounded-xl border-2 border-qt-border active:border-qt-green transition-all cursor-pointer text-left w-full"
              >
                <div className="size-12 rounded-xl bg-qt-bg-3 flex items-center justify-center shrink-0">
                  <Globe size={20} className="text-qt-secondary" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-sm text-qt-primary">Add international Account</p>
                  <p className="text-xs text-qt-secondary">Link a bank outside Canada and the U.S. using SWIFT/BIC</p>
                </div>
                <ChevronRight size={20} className="text-qt-gray-dark" />
              </button>
            </div>
          )}

          {mode === 'manual' && (
            <div className="flex flex-col items-center gap-4">
              <div className={manualSectionBox}>
                <p className="text-xs font-normal uppercase tracking-wide text-figma-neutral-200">Deposit account</p>
                <p className={manualHelperText}>Choose the currency for withdrawals to this bank.</p>
                <div>
                  <p className="mb-2 text-sm font-normal text-figma-neutral-200">Deposit currency</p>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setDepositCurrency('CAD')}
                      className={`${manualCurrencyBtnBase} ${
                        depositCurrency === 'CAD'
                          ? 'border-qt-green bg-qt-green-bg/30 text-[var(--ads-color-body-contrast-100)] shadow-sm'
                          : 'border-[var(--ads-color-secondary-400)] bg-[var(--ads-color-elevation-overlay)] text-[var(--ads-color-body-contrast-100)] active:border-qt-green'
                      }`}
                    >
                      CAD
                    </button>
                    <button
                      type="button"
                      onClick={() => setDepositCurrency('USD')}
                      className={`${manualCurrencyBtnBase} ${
                        depositCurrency === 'USD'
                          ? 'border-qt-green bg-qt-green-bg/30 text-[var(--ads-color-body-contrast-100)] shadow-sm'
                          : 'border-[var(--ads-color-secondary-400)] bg-[var(--ads-color-elevation-overlay)] text-[var(--ads-color-body-contrast-100)] active:border-qt-green'
                      }`}
                    >
                      USD
                    </button>
                  </div>
                </div>
              </div>

              <div className={manualSectionBox}>
                <p className={manualSectionTitle}>Canadian bank information</p>
                <div>
                  <label className="mb-2 block text-sm font-normal text-figma-neutral-200">Financial institution</label>
                  <select
                    value={selectedBank}
                    onChange={(e) => setSelectedBank(e.target.value)}
                    className={manualSelectClass}
                  >
                    <option value="" disabled>
                      Select institution
                    </option>
                    {bankOptions.map((b) => (
                      <option key={b.value} value={b.value}>
                        {b.label}
                      </option>
                    ))}
                  </select>
                </div>
                <MobileInputField
                  variant="picker"
                  label="Transit number"
                  placeholder="e.g. 12345"
                  value={transit}
                  onChange={(e) => setTransit(e.target.value)}
                  maxLength={5}
                />
                <MobileInputField
                  variant="picker"
                  label="Account number"
                  placeholder="e.g. 1234567"
                  value={accountNum}
                  onChange={(e) => setAccountNum(e.target.value)}
                />
                <div>
                  <p className="mb-3 text-sm font-normal text-figma-neutral-200">Is this account personal or corporate?</p>
                  <div className="flex flex-col gap-3 sm:flex-row sm:gap-8">
                    <label className="flex min-h-[44px] cursor-pointer items-center gap-3">
                      <input
                        type="radio"
                        name={manualHolderRadioName}
                        checked={manualAccountHolderType === 'personal'}
                        onChange={() => setManualAccountHolderType('personal')}
                        className="size-5 accent-qt-green"
                      />
                      <span className="text-sm font-bold leading-snug text-[var(--ads-color-body-contrast-100)]">
                        Personal
                      </span>
                    </label>
                    <label className="flex min-h-[44px] cursor-pointer items-center gap-3">
                      <input
                        type="radio"
                        name={manualHolderRadioName}
                        checked={manualAccountHolderType === 'corporate'}
                        onChange={() => setManualAccountHolderType('corporate')}
                        className="size-5 accent-qt-green"
                      />
                      <span className="text-sm font-bold leading-snug text-[var(--ads-color-body-contrast-100)]">
                        Corporate
                      </span>
                    </label>
                  </div>
                </div>
              </div>

              <div className={manualSectionBox}>
                <p className={manualSectionTitle}>Void cheque or direct deposit</p>
                <p className="text-xs font-normal text-figma-neutral-200">Upload a PDF, JPG, or PNG of your void cheque or direct deposit form.</p>
                <div
                  className={manualUploadZoneClass}
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (e.dataTransfer.files?.[0]) setVoidCheque(e.dataTransfer.files[0]);
                  }}
                  onClick={() => document.getElementById('mobile-void-cheque-upload')?.click()}
                >
                  <input
                    id="mobile-void-cheque-upload"
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files?.[0]) setVoidCheque(e.target.files[0]);
                    }}
                  />
                  {voidCheque ? (
                    <div className="flex flex-col items-center gap-2">
                      <CheckCircle2 size={28} className="text-qt-green" aria-hidden />
                      <p className="text-sm font-bold leading-snug text-[var(--ads-color-body-contrast-100)]">{voidCheque.name}</p>
                      <p className="text-xs font-normal text-figma-neutral-200">Tap to replace</p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      <Upload size={28} className="text-figma-neutral-200" aria-hidden />
                      <p className="text-sm font-bold leading-snug text-[var(--ads-color-body-contrast-100)]">
                        Tap to browse or drag & drop
                      </p>
                      <p className="text-xs font-normal text-figma-neutral-200">PDF, JPG, PNG</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex w-full max-w-[357px] gap-3 pt-1">
                <MobileButton variant="secondary" onClick={() => setMode('choose')} fullWidth={false} className="flex-1">
                  Back
                </MobileButton>
                <MobileButton
                  onClick={submitManualLink}
                  disabled={!selectedBank || !transit || !accountNum || !voidCheque}
                  fullWidth={false}
                  className="flex-1"
                >
                  Link account
                </MobileButton>
              </div>
            </div>
          )}

          {mode === 'international' && (
            <div className="flex flex-col gap-4">
              <p className="text-xs text-qt-secondary">
                Enter the same international wire details you would use for a transfer. Wire currency applies to deposits
                to this linked account.
              </p>
              <div className="max-h-[min(58vh,480px)] overflow-y-auto overscroll-y-contain pr-1 -mr-1">
                <MobileInternationalWireFormBody
                  id={intlFormId}
                  variant="link_bank"
                  data={intlWire}
                  onChange={(next) => {
                    setIntlWire(next);
                    setIntlSigned(false);
                  }}
                />
                <div className="mx-auto mt-4 flex w-full max-w-[357px] flex-col self-center rounded-[length:var(--ads-border-radius-m)] border border-solid border-[var(--ads-color-secondary-400)] bg-[var(--ads-color-elevation-overlay)] p-4">
                  <MobileESignature
                    variant="picker"
                    label="Initials"
                    signed={intlSigned}
                    onSign={() => setIntlSigned(true)}
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <MobileButton variant="secondary" onClick={() => setMode('choose')} fullWidth={false} className="flex-1">
                  Back
                </MobileButton>
                <MobileButton
                  onClick={handleSaveInternational}
                  disabled={!intlFormValid}
                  fullWidth={false}
                  className="flex-1"
                >
                  Link account
                </MobileButton>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
