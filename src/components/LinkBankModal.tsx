import { useId, useState } from 'react';
import { X, Building2, ChevronRight, Upload, CheckCircle2, Globe } from 'lucide-react';
import type { LinkedBank, Currency, InternationalWireData } from '../types';
import { bankOptions } from '../data/accounts';
import { emptyInternationalWireData, hasInternationalLinkComplete } from '../lib/internationalWire';
import {
  manualCurrencyBtnBase,
  manualHelperText,
  manualPickerInputClass,
  manualSectionBox,
  manualSectionTitle,
  manualSelectClass,
  manualUploadZoneClass,
} from '../lib/adsLinkBankSectionStyles';
import Button from './Button';
import InternationalWireForm from './InternationalWireForm';
import ESignature from './ESignature';

interface LinkBankModalProps {
  onClose: () => void;
  onSave: (bank: LinkedBank) => void;
}

type LinkMode = 'choose' | 'select_bank' | 'manual' | 'international';

export default function LinkBankModal({ onClose, onSave }: LinkBankModalProps) {
  const manualHolderRadioName = useId();
  const [mode, setMode] = useState<LinkMode>('choose');
  const [selectedBank, setSelectedBank] = useState('');
  const [transit, setTransit] = useState('');
  const [accountNum, setAccountNum] = useState('');
  const [voidCheque, setVoidCheque] = useState<File | null>(null);
  const [depositCurrency, setDepositCurrency] = useState<Currency>('CAD');
  const [manualAccountHolderType, setManualAccountHolderType] = useState<'personal' | 'corporate'>('personal');

  const [intlWire, setIntlWire] = useState<InternationalWireData>(() => emptyInternationalWireData());
  const [intlSigned, setIntlSigned] = useState(false);

  function handleSave() {
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
    onSave(newBank);
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto font-[family-name:var(--font-body)]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-qt-border">
          <h3 className="text-xl font-semibold text-qt-primary">Connect bank account</h3>
          <button onClick={onClose} className="text-qt-secondary hover:text-qt-primary cursor-pointer">
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          {mode === 'choose' && (
            <div className="flex flex-col gap-3">
              <button
                type="button"
                onClick={() => setMode('select_bank')}
                className="flex items-center gap-3 p-4 rounded-lg border border-qt-border hover:border-qt-green transition-all cursor-pointer text-left w-full"
              >
                <div className="size-10 rounded-full bg-qt-green-bg flex items-center justify-center shrink-0">
                  <Building2 size={18} className="text-qt-green-dark" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-sm text-qt-primary">Connect automatically</p>
                  <p className="text-xs text-qt-secondary">Securely link your bank using online banking credentials</p>
                </div>
                <ChevronRight size={18} className="text-qt-gray-dark" />
              </button>
              <button
                type="button"
                onClick={() => setMode('manual')}
                className="flex items-center gap-3 p-4 rounded-lg border border-qt-border hover:border-qt-green transition-all cursor-pointer text-left w-full"
              >
                <div className="size-10 rounded-full bg-qt-bg-3 flex items-center justify-center shrink-0">
                  <Building2 size={18} className="text-qt-secondary" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-sm text-qt-primary">Enter manually</p>
                  <p className="text-xs text-qt-secondary">Enter your institution, transit, and account number</p>
                </div>
                <ChevronRight size={18} className="text-qt-gray-dark" />
              </button>
              <button
                type="button"
                onClick={() => {
                  setIntlWire(emptyInternationalWireData());
                  setIntlSigned(false);
                  setMode('international');
                }}
                className="flex items-center gap-3 p-4 rounded-lg border border-qt-border hover:border-qt-green transition-all cursor-pointer text-left w-full"
              >
                <div className="size-10 rounded-full bg-qt-bg-3 flex items-center justify-center shrink-0">
                  <Globe size={18} className="text-qt-secondary" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-sm text-qt-primary">Add international Account</p>
                  <p className="text-xs text-qt-secondary">Link a bank outside Canada and the U.S. using SWIFT/BIC</p>
                </div>
                <ChevronRight size={18} className="text-qt-gray-dark" />
              </button>
            </div>
          )}

          {mode === 'select_bank' && (
            <div>
              <button
                type="button"
                onClick={() => setMode('choose')}
                className="mb-3 text-sm font-semibold text-qt-green-dark hover:opacity-80"
              >
                ← Back
              </button>
              <p className="text-sm text-qt-secondary mb-4">Select your financial institution</p>
              <div className="grid grid-cols-2 gap-2 max-h-[400px] overflow-y-auto">
                {bankOptions.filter(b => b.value !== 'other').map((bank) => (
                  <button
                    key={bank.value}
                    type="button"
                    onClick={() => {
                      setSelectedBank(bank.value);
                      setMode('manual');
                    }}
                    className="flex items-center gap-2 p-3 rounded-lg border border-qt-border hover:border-qt-green hover:bg-qt-green-bg/20 transition-all cursor-pointer text-left"
                  >
                    <div className="size-8 rounded-full bg-qt-bg-3 flex items-center justify-center shrink-0">
                      <Building2 size={14} className="text-qt-secondary" />
                    </div>
                    <p className="text-sm text-qt-primary font-medium truncate">{bank.label}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {mode === 'manual' && (
            <div className="flex flex-col items-center gap-4 font-[family-name:var(--font-body)]">
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
                  <select value={selectedBank} onChange={(e) => setSelectedBank(e.target.value)} className={manualSelectClass}>
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
                <div>
                  <label className="mb-2 block text-sm font-normal text-figma-neutral-200">Transit number</label>
                  <input
                    type="text"
                    placeholder="e.g. 12345"
                    value={transit}
                    onChange={(e) => setTransit(e.target.value)}
                    maxLength={5}
                    className={manualPickerInputClass}
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-normal text-figma-neutral-200">Account number</label>
                  <input
                    type="text"
                    placeholder="e.g. 1234567"
                    value={accountNum}
                    onChange={(e) => setAccountNum(e.target.value)}
                    className={manualPickerInputClass}
                  />
                </div>
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
                <p className="text-xs font-normal text-figma-neutral-200">
                  Upload a PDF, JPG, or PNG of your void cheque or direct deposit form.
                </p>
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
                  onClick={() => document.getElementById('void-cheque-upload')?.click()}
                >
                  <input
                    id="void-cheque-upload"
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files?.[0]) setVoidCheque(e.target.files[0]);
                    }}
                  />
                  {voidCheque ? (
                    <div className="flex flex-col items-center gap-1.5">
                      <CheckCircle2 size={22} className="text-qt-green" aria-hidden />
                      <p className="text-sm font-bold leading-snug text-[var(--ads-color-body-contrast-100)]">{voidCheque.name}</p>
                      <p className="text-xs font-normal text-figma-neutral-200">Click or drag to replace</p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-1.5">
                      <Upload size={22} className="text-figma-neutral-200" aria-hidden />
                      <p className="text-sm font-bold leading-snug text-[var(--ads-color-body-contrast-100)]">
                        Drag & drop your file here, or <span className="font-semibold text-qt-green-dark">browse</span>
                      </p>
                      <p className="text-xs font-normal text-figma-neutral-200">PDF, JPG, PNG</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex w-full max-w-[357px] gap-3 pt-1">
                <Button variant="secondary" onClick={() => setMode('choose')} className="flex-1">
                  Back
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={!selectedBank || !transit || !accountNum || !voidCheque}
                  className="flex-1"
                >
                  Link account
                </Button>
              </div>
            </div>
          )}

          {mode === 'international' && (
            <div className="flex flex-col gap-4">
              <p className="text-xs text-qt-secondary">
                Enter the same international wire details you would use for a transfer. Initials confirm your information.
              </p>
              <InternationalWireForm
                linkBank
                currency={intlWire.currency}
                amount=""
                data={intlWire}
                onChange={(next) => {
                  setIntlWire(next);
                  setIntlSigned(false);
                }}
              />
              <ESignature label="Initials" signed={intlSigned} onSign={() => setIntlSigned(true)} />

              <div className="flex gap-3 pt-2">
                <Button variant="secondary" onClick={() => setMode('choose')}>Back</Button>
                <Button onClick={handleSaveInternational} disabled={!intlFormValid}>
                  Link account
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
