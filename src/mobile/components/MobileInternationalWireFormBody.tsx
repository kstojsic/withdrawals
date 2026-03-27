import type { Currency, InternationalWireData } from '../../types';
import MobileInputField from './MobileInputField';

const sectionBox =
  'flex w-full max-w-[357px] flex-col gap-4 self-center rounded-[length:var(--ads-border-radius-m)] border border-solid border-[var(--ads-color-secondary-400)] bg-[var(--ads-color-elevation-overlay)] p-4';

const sectionTitle = 'text-sm font-bold leading-snug text-[var(--ads-color-body-contrast-100)]';

const helperText = 'text-sm font-normal text-figma-neutral-200';

const radioLabel = 'text-sm font-bold leading-snug text-[var(--ads-color-body-contrast-100)]';

const currencyBtnBase =
  'min-h-[52px] rounded-[length:var(--ads-border-radius-m)] border border-solid text-sm font-bold transition-colors';

const reasonTextareaClass =
  'w-full min-h-[88px] rounded-[length:var(--ads-border-radius-m)] border border-solid border-[var(--ads-color-secondary-400)] bg-[var(--ads-color-elevation-overlay)] px-4 py-3 text-sm font-bold leading-snug text-[var(--ads-color-body-contrast-100)] outline-none transition-colors placeholder:font-normal placeholder:italic placeholder:text-figma-neutral-200 focus:border-qt-green focus:shadow-sm';

export interface MobileInternationalWireFormBodyProps {
  id: string;
  data: InternationalWireData;
  onChange: (data: InternationalWireData) => void;
  variant: 'withdrawal' | 'link_bank';
  /** Withdrawal flow: label for amount display (CA$ / US$). */
  withdrawalCurrency?: Currency;
  withdrawalAmount?: string;
}

export default function MobileInternationalWireFormBody({
  id,
  data,
  onChange,
  variant,
  withdrawalCurrency = 'CAD',
  withdrawalAmount = '',
}: MobileInternationalWireFormBodyProps) {
  function update(field: keyof InternationalWireData, value: string | boolean) {
    onChange({ ...data, [field]: value });
  }

  const amountLabel = withdrawalCurrency === 'CAD' ? 'CA' : 'US';

  return (
    <div className="flex flex-col items-center gap-4">
      <div className={sectionBox}>
        <p className="text-xs font-normal uppercase tracking-wide text-figma-neutral-200">
          {variant === 'link_bank' ? 'Account information' : 'Pre-filled information'}
        </p>
        <div className="flex flex-col gap-3">
          {variant === 'withdrawal' ? (
            <>
              <div>
                <p className="text-xs font-normal text-figma-neutral-200">Account holder</p>
                <p className="text-sm font-bold leading-snug text-[var(--ads-color-body-contrast-100)]">
                  {data.firstName} {data.lastName}
                </p>
              </div>
              <div>
                <p className="text-xs font-normal text-figma-neutral-200">Withdrawal amount</p>
                <p className="text-sm font-bold leading-snug text-[var(--ads-color-body-contrast-100)]">
                  {amountLabel}$
                  {withdrawalAmount
                    ? parseFloat(withdrawalAmount).toLocaleString('en-CA', { minimumFractionDigits: 2 })
                    : '0.00'}
                </p>
              </div>
            </>
          ) : (
            <>
              <MobileInputField
                variant="picker"
                label="First name"
                placeholder="First name"
                value={data.firstName}
                onChange={(e) => update('firstName', e.target.value)}
                autoComplete="given-name"
              />
              <MobileInputField
                variant="picker"
                label="Last name"
                placeholder="Last name"
                value={data.lastName}
                onChange={(e) => update('lastName', e.target.value)}
                autoComplete="family-name"
              />
              <p className="text-xs text-figma-neutral-200">
                Withdrawal amount will be set when you request a transfer.
              </p>
            </>
          )}
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
          {variant === 'link_bank' && (
            <div>
              <label className="mb-2 block text-sm font-normal text-figma-neutral-200">
                Reason for wire (optional)
              </label>
              <textarea
                value={data.reason}
                onChange={(e) => update('reason', e.target.value)}
                placeholder="e.g. savings transfer"
                rows={3}
                className={reasonTextareaClass}
              />
            </div>
          )}
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
    </div>
  );
}
