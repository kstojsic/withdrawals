import { useEffect, useState } from 'react';
import type { Currency, InternationalWireData } from '../types';
import { hasInternationalWireBeneficiaryCore } from '../lib/internationalWire';
import InputField from './InputField';
import RadioButton from './RadioButton';

interface InternationalWireFormProps {
  currency: Currency;
  amount: string;
  onChange: (data: InternationalWireData) => void;
  data: InternationalWireData;
  /** Link-bank flow: editable holder, wire currency, optional reason; omits withdrawal amount. */
  linkBank?: boolean;
}

export default function InternationalWireForm({
  currency,
  amount,
  onChange,
  data,
  linkBank = false,
}: InternationalWireFormProps) {
  function update(field: keyof InternationalWireData, value: string | boolean) {
    onChange({ ...data, [field]: value });
  }

  const coreComplete = hasInternationalWireBeneficiaryCore(data);
  const [showFullForm, setShowFullForm] = useState(false);

  useEffect(() => {
    if (!coreComplete) setShowFullForm(false);
  }, [coreComplete]);

  const compact = !linkBank && coreComplete && !showFullForm;

  return (
    <div className="flex flex-col gap-6">
      <div className="bg-qt-bg-3 rounded-lg p-4">
        <p className="text-xs font-bold tracking-wider uppercase text-qt-secondary mb-2">
          {linkBank ? 'Account information' : 'Pre-filled information'}
        </p>
        {linkBank ? (
          <div className="flex flex-col gap-4">
            <InputField
              label="First name"
              placeholder="First name"
              value={data.firstName}
              onChange={(e) => update('firstName', e.target.value)}
            />
            <InputField
              label="Last name"
              placeholder="Last name"
              value={data.lastName}
              onChange={(e) => update('lastName', e.target.value)}
            />
            <p className="text-xs text-qt-secondary">Withdrawal amount will be set when you request a transfer.</p>
            <div>
              <p className="text-sm text-qt-secondary mb-2">Wire currency</p>
              <div className="grid grid-cols-2 gap-2">
                {(['CAD', 'USD'] as const).map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => update('currency', c)}
                    className={`min-h-11 rounded-md border px-3 text-sm font-semibold transition-colors ${
                      data.currency === c
                        ? 'border-qt-green bg-qt-green-bg/30 text-qt-primary'
                        : 'border-qt-border bg-white text-qt-secondary'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm font-semibold text-qt-primary mb-1 block">Reason for wire (optional)</label>
              <textarea
                value={data.reason}
                onChange={(e) => update('reason', e.target.value)}
                placeholder="e.g. savings transfer"
                rows={3}
                className="w-full rounded-md border border-qt-gray-dark bg-white px-4 py-3 text-sm text-qt-primary outline-none focus:border-qt-green"
              />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs text-qt-secondary">Account holder</p>
              <p className="text-sm font-semibold text-qt-primary">{data.firstName} {data.lastName}</p>
            </div>
            <div>
              <p className="text-xs text-qt-secondary">Withdrawal amount</p>
              <p className="text-sm font-semibold text-qt-primary">
                {currency === 'CAD' ? 'CA' : 'US'}${amount ? parseFloat(amount).toLocaleString('en-CA', { minimumFractionDigits: 2 }) : '0.00'}
              </p>
            </div>
            <div>
              <p className="text-xs text-qt-secondary">Currency</p>
              <p className="text-sm font-semibold text-qt-primary">{currency}</p>
            </div>
          </div>
        )}
      </div>

      {compact ? (
        <div className="flex flex-col gap-3">
          <div className="rounded-lg border border-qt-border bg-white p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-qt-secondary">Receiving bank (saved)</p>
            <p className="mt-2 text-sm font-semibold text-qt-primary">{data.bankName}</p>
            <p className="mt-1 text-sm text-qt-secondary">
              SWIFT / BIC: <span className="font-semibold text-qt-primary">{data.swiftCode}</span>
            </p>
            {data.bankAccountNumber?.trim() ? (
              <p className="mt-1 text-sm text-qt-secondary">
                Account: <span className="font-semibold text-qt-primary">{data.bankAccountNumber}</span>
              </p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={() => setShowFullForm(true)}
            className="text-left text-sm font-semibold text-qt-green-dark hover:underline cursor-pointer"
          >
            Change receiving bank details
          </button>
        </div>
      ) : (
        <>
          <div className="border-t border-qt-border pt-6">
        <p className="font-semibold text-base text-qt-primary leading-6 mb-4">International bank information</p>
        <div className="flex flex-col gap-4">
          <InputField
            label="Bank name"
            placeholder="Enter bank name"
            value={data.bankName}
            onChange={(e) => update('bankName', e.target.value)}
          />
          <InputField
            label="Bank address"
            placeholder="Enter bank address"
            value={data.bankAddress}
            onChange={(e) => update('bankAddress', e.target.value)}
          />
          <div className="grid grid-cols-2 gap-4">
            <InputField
              label="City"
              placeholder="Enter city"
              value={data.bankCity}
              onChange={(e) => update('bankCity', e.target.value)}
            />
            <InputField
              label="Country"
              placeholder="Enter country"
              value={data.bankCountry}
              onChange={(e) => update('bankCountry', e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <InputField
              label="SWIFT / BIC code"
              placeholder="e.g. BOFAUS3N"
              value={data.swiftCode}
              onChange={(e) => update('swiftCode', e.target.value)}
            />
            <InputField
              label="Account number / IBAN"
              placeholder="Enter account number"
              value={data.bankAccountNumber}
              onChange={(e) => update('bankAccountNumber', e.target.value)}
            />
          </div>
          <InputField
            label="Routing number (required for U.S. banks)"
            placeholder="e.g. 021000021"
            value={data.routingNumber}
            onChange={(e) => update('routingNumber', e.target.value)}
            maxLength={9}
          />
        </div>
      </div>

      <div className="border-t border-qt-border pt-6">
        <p className="font-semibold text-base text-qt-primary leading-6 mb-3">Intermediary bank information</p>
        <div className="mb-4">
          <p className="text-sm text-qt-secondary mb-3">Is an intermediary bank required?</p>
          <div className="flex gap-6">
            <RadioButton
              name="intermediary"
              value="yes"
              label="Yes"
              checked={data.hasIntermediary}
              onChange={() => update('hasIntermediary', true)}
            />
            <RadioButton
              name="intermediary"
              value="no"
              label="No"
              checked={!data.hasIntermediary}
              onChange={() => update('hasIntermediary', false)}
            />
          </div>
        </div>

        {data.hasIntermediary && (
          <div className="flex flex-col gap-4 animate-[fadeSlideIn_0.3s_ease-out]">
            <InputField
              label="Intermediary bank name"
              placeholder="Enter intermediary bank name"
              value={data.intermediaryBankName}
              onChange={(e) => update('intermediaryBankName', e.target.value)}
            />
            <div className="grid grid-cols-2 gap-4">
              <InputField
                label="SWIFT / BIC code"
                placeholder="e.g. CHASUS33"
                value={data.intermediarySwiftCode}
                onChange={(e) => update('intermediarySwiftCode', e.target.value)}
              />
              <InputField
                label="Account number"
                placeholder="Enter account number"
                value={data.intermediaryAccountNumber}
                onChange={(e) => update('intermediaryAccountNumber', e.target.value)}
              />
            </div>
          </div>
        )}
      </div>

      <div className="border-t border-qt-border pt-6">
        <p className="font-semibold text-base text-qt-primary leading-6 mb-3">Brokerage account information</p>
        <p className="text-sm text-qt-secondary mb-4">Only applicable if you are wiring funds to another brokerage.</p>
        <div className="mb-4">
          <p className="text-sm text-qt-secondary mb-3">Are you wiring to another brokerage?</p>
          <div className="flex gap-6">
            <RadioButton
              name="is-brokerage"
              value="yes"
              label="Yes"
              checked={data.isBrokerage}
              onChange={() => update('isBrokerage', true)}
            />
            <RadioButton
              name="is-brokerage"
              value="no"
              label="No"
              checked={!data.isBrokerage}
              onChange={() => update('isBrokerage', false)}
            />
          </div>
        </div>

        {data.isBrokerage && (
          <div className="flex flex-col gap-4 animate-[fadeSlideIn_0.3s_ease-out]">
            <InputField
              label="Brokerage name"
              placeholder="e.g. Fidelity, Charles Schwab"
              value={data.brokerageName}
              onChange={(e) => update('brokerageName', e.target.value)}
            />
            <InputField
              label="Name on brokerage account"
              placeholder="Enter the account holder's name"
              value={data.brokerageAccountName}
              onChange={(e) => update('brokerageAccountName', e.target.value)}
            />
            <InputField
              label="Brokerage account number"
              placeholder="Enter account number"
              value={data.brokerageAccountNumber}
              onChange={(e) => update('brokerageAccountNumber', e.target.value)}
            />
          </div>
        )}
      </div>

          {coreComplete && (
            <button
              type="button"
              onClick={() => setShowFullForm(false)}
              className="text-left text-sm font-semibold text-qt-secondary hover:underline cursor-pointer"
            >
              Use saved details only
            </button>
          )}
        </>
      )}
    </div>
  );
}
