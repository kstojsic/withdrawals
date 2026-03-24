import { useId } from 'react';
import { X } from 'lucide-react';
import type { Currency, InternationalWireData } from '../../types';
import { hasInternationalWireBeneficiaryCore } from '../../lib/internationalWire';
import MobileInputField from './MobileInputField';
import MobileButton from './MobileButton';
import MobileESignature from './MobileESignature';

/** Matches `MobileBankDepositDropdown` / `MobileAccountDropdown` surface styling. */
const sectionBox =
  'flex w-full max-w-[357px] flex-col gap-4 self-center rounded-[length:var(--ads-border-radius-m)] border border-solid border-[var(--ads-color-secondary-400)] bg-[var(--ads-color-elevation-overlay)] p-4';

const sectionTitle = 'text-sm font-bold leading-snug text-[var(--ads-color-body-contrast-100)]';

const helperText = 'text-sm font-normal text-figma-neutral-200';

const radioLabel = 'text-sm font-bold leading-snug text-[var(--ads-color-body-contrast-100)]';

const currencyBtnBase =
  'min-h-[52px] rounded-[length:var(--ads-border-radius-m)] border border-solid text-sm font-bold transition-colors';

interface MobileInternationalWireModalProps {
  open: boolean;
  onClose: () => void;
  currency: Currency;
  amount: string;
  data: InternationalWireData;
  onChange: (data: InternationalWireData) => void;
  signed: boolean;
  onSign: (initials: string) => void;
}

export default function MobileInternationalWireModal({
  open,
  onClose,
  currency,
  amount,
  data,
  onChange,
  signed,
  onSign,
}: MobileInternationalWireModalProps) {
  const id = useId();
  function update(field: keyof InternationalWireData, value: string | boolean) {
    onChange({ ...data, [field]: value });
  }

  const canSave = hasInternationalWireBeneficiaryCore(data) && signed;

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center bg-black/50 sm:items-center"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="presentation"
    >
      <div
        className="flex max-h-[92vh] w-full max-w-[430px] flex-col rounded-t-2xl bg-white shadow-2xl sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby={`${id}-title`}
      >
        <div className="flex shrink-0 items-center justify-between border-b border-solid border-[var(--ads-color-secondary-400)] px-4 py-4">
          <h3
            id={`${id}-title`}
            className="font-[family-name:var(--ads-font-family-body)] text-[length:var(--ads-font-size-s)] font-semibold leading-[length:var(--ads-font-line-height-s)] text-[var(--ads-color-body-contrast-100)]"
          >
            International wire details
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="flex min-h-[44px] min-w-[44px] cursor-pointer items-center justify-center text-figma-neutral-200 active:text-[var(--ads-color-body-contrast-100)]"
            aria-label="Close"
          >
            <X size={24} />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
          <div className="flex flex-col items-center gap-4">
            <div className={sectionBox}>
              <p className="text-xs font-normal uppercase tracking-wide text-figma-neutral-200">
                Pre-filled information
              </p>
              <div className="flex flex-col gap-3">
                <div>
                  <p className="text-xs font-normal text-figma-neutral-200">Account holder</p>
                  <p className="text-sm font-bold leading-snug text-[var(--ads-color-body-contrast-100)]">
                    {data.firstName} {data.lastName}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-normal text-figma-neutral-200">Withdrawal amount</p>
                  <p className="text-sm font-bold leading-snug text-[var(--ads-color-body-contrast-100)]">
                    {currency === 'CAD' ? 'CA' : 'US'}$
                    {amount ? parseFloat(amount).toLocaleString('en-CA', { minimumFractionDigits: 2 }) : '0.00'}
                  </p>
                </div>
                <div>
                  <p className="mb-2 text-sm font-normal text-figma-neutral-200">Wire currency</p>
                  <div className="grid grid-cols-2 gap-2">
                    {(['CAD', 'USD'] as const).map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => update('currency', c)}
                        className={`${currencyBtnBase} ${
                          data.currency === c
                            ? 'border-qt-green bg-qt-green-bg/30 text-[var(--ads-color-body-contrast-100)] shadow-sm'
                            : 'border-[var(--ads-color-secondary-400)] bg-[var(--ads-color-elevation-overlay)] text-[var(--ads-color-body-contrast-100)] active:border-qt-green'
                        }`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className={sectionBox}>
              <p className={sectionTitle}>International bank information</p>
              <MobileInputField
                variant="picker"
                label="Bank name"
                placeholder="Enter bank name"
                value={data.bankName}
                onChange={(e) => update('bankName', e.target.value)}
              />
              <MobileInputField
                variant="picker"
                label="Bank address"
                placeholder="Enter bank address"
                value={data.bankAddress}
                onChange={(e) => update('bankAddress', e.target.value)}
              />
              <div className="grid grid-cols-2 gap-3">
                <MobileInputField
                  variant="picker"
                  label="City"
                  placeholder="City"
                  value={data.bankCity}
                  onChange={(e) => update('bankCity', e.target.value)}
                />
                <MobileInputField
                  variant="picker"
                  label="Country"
                  placeholder="Country"
                  value={data.bankCountry}
                  onChange={(e) => update('bankCountry', e.target.value)}
                />
              </div>
              <MobileInputField
                variant="picker"
                label="SWIFT / BIC code"
                placeholder="e.g. BOFAUS3N"
                value={data.swiftCode}
                onChange={(e) => update('swiftCode', e.target.value)}
              />
              <MobileInputField
                variant="picker"
                label="Account number / IBAN"
                placeholder="Enter account number"
                value={data.bankAccountNumber}
                onChange={(e) => update('bankAccountNumber', e.target.value)}
              />
              <MobileInputField
                variant="picker"
                label="Routing number (required for U.S. banks)"
                placeholder="e.g. 021000021"
                value={data.routingNumber}
                onChange={(e) => update('routingNumber', e.target.value)}
                maxLength={9}
              />
            </div>

            <div className={sectionBox}>
              <p className={sectionTitle}>Intermediary bank information</p>
              <p className={helperText}>Is an intermediary bank required?</p>
              <div className="flex gap-6">
                <label className="flex min-h-[44px] cursor-pointer items-center gap-3">
                  <input
                    type="radio"
                    name={`${id}-intermediary`}
                    checked={data.hasIntermediary}
                    onChange={() => update('hasIntermediary', true)}
                    className="size-5 accent-qt-green"
                  />
                  <span className={radioLabel}>Yes</span>
                </label>
                <label className="flex min-h-[44px] cursor-pointer items-center gap-3">
                  <input
                    type="radio"
                    name={`${id}-intermediary`}
                    checked={!data.hasIntermediary}
                    onChange={() => update('hasIntermediary', false)}
                    className="size-5 accent-qt-green"
                  />
                  <span className={radioLabel}>No</span>
                </label>
              </div>
              {data.hasIntermediary && (
                <div className="flex flex-col gap-4 border-t border-solid border-[var(--ads-color-secondary-400)] pt-4">
                  <MobileInputField
                    variant="picker"
                    label="Intermediary bank name"
                    placeholder="Enter intermediary bank name"
                    value={data.intermediaryBankName}
                    onChange={(e) => update('intermediaryBankName', e.target.value)}
                  />
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <MobileInputField
                      variant="picker"
                      label="SWIFT / BIC code"
                      placeholder="e.g. CHASUS33"
                      value={data.intermediarySwiftCode}
                      onChange={(e) => update('intermediarySwiftCode', e.target.value)}
                    />
                    <MobileInputField
                      variant="picker"
                      label="Account number"
                      placeholder="Enter account number"
                      value={data.intermediaryAccountNumber}
                      onChange={(e) => update('intermediaryAccountNumber', e.target.value)}
                    />
                  </div>
                </div>
              )}
            </div>

            <div className={sectionBox}>
              <p className={sectionTitle}>Brokerage account information</p>
              <p className={helperText}>Only applicable if you are wiring funds to another brokerage.</p>
              <p className={helperText}>Are you wiring to another brokerage?</p>
              <div className="flex gap-6">
                <label className="flex min-h-[44px] cursor-pointer items-center gap-3">
                  <input
                    type="radio"
                    name={`${id}-brokerage`}
                    checked={data.isBrokerage}
                    onChange={() => update('isBrokerage', true)}
                    className="size-5 accent-qt-green"
                  />
                  <span className={radioLabel}>Yes</span>
                </label>
                <label className="flex min-h-[44px] cursor-pointer items-center gap-3">
                  <input
                    type="radio"
                    name={`${id}-brokerage`}
                    checked={!data.isBrokerage}
                    onChange={() => update('isBrokerage', false)}
                    className="size-5 accent-qt-green"
                  />
                  <span className={radioLabel}>No</span>
                </label>
              </div>
              {data.isBrokerage && (
                <div className="flex flex-col gap-4 border-t border-solid border-[var(--ads-color-secondary-400)] pt-4">
                  <MobileInputField
                    variant="picker"
                    label="Brokerage name"
                    placeholder="e.g. Fidelity, Charles Schwab"
                    value={data.brokerageName}
                    onChange={(e) => update('brokerageName', e.target.value)}
                  />
                  <MobileInputField
                    variant="picker"
                    label="Name on brokerage account"
                    placeholder="Enter the account holder's name"
                    value={data.brokerageAccountName}
                    onChange={(e) => update('brokerageAccountName', e.target.value)}
                  />
                  <MobileInputField
                    variant="picker"
                    label="Brokerage account number"
                    placeholder="Enter account number"
                    value={data.brokerageAccountNumber}
                    onChange={(e) => update('brokerageAccountNumber', e.target.value)}
                  />
                </div>
              )}
            </div>

            <div className={sectionBox}>
              <MobileESignature variant="picker" label="Initials" onSign={onSign} signed={signed} />
            </div>
          </div>
        </div>

        <div className="shrink-0 border-t border-solid border-[var(--ads-color-secondary-400)] bg-white p-4">
          {!canSave && (
            <p className="mb-2 text-center text-xs font-normal text-figma-neutral-200">
              Enter receiving bank name and SWIFT/BIC, then confirm your initials to save.
            </p>
          )}
          <div className="mx-auto w-full max-w-[357px]">
            <MobileButton disabled={!canSave} onClick={onClose}>
              Save and continue
            </MobileButton>
          </div>
        </div>
      </div>
    </div>
  );
}
