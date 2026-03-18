import type { Currency, InternationalWireData } from '../../types';
import MobileInputField from './MobileInputField';

interface MobileInternationalWireFormProps {
  currency: Currency;
  amount: string;
  onChange: (data: InternationalWireData) => void;
  data: InternationalWireData;
}

export default function MobileInternationalWireForm({ currency, amount, onChange, data }: MobileInternationalWireFormProps) {
  function update(field: keyof InternationalWireData, value: string | boolean) {
    onChange({ ...data, [field]: value });
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="bg-qt-bg-3 rounded-xl p-4">
        <p className="text-xs font-bold tracking-wider uppercase text-qt-secondary mb-2">Pre-filled information</p>
        <div className="flex flex-col gap-3">
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
      </div>

      <MobileInputField
        label="Reason for wire transfer"
        placeholder="e.g. Personal funds transfer"
        value={data.reason}
        onChange={(e) => update('reason', e.target.value)}
      />

      <div className="border-t border-qt-border pt-6">
        <p className="font-semibold text-base text-qt-primary leading-6 mb-4">International bank information</p>
        <div className="flex flex-col gap-4">
          <MobileInputField
            label="Bank name"
            placeholder="Enter bank name"
            value={data.bankName}
            onChange={(e) => update('bankName', e.target.value)}
          />
          <MobileInputField
            label="Bank address"
            placeholder="Enter bank address"
            value={data.bankAddress}
            onChange={(e) => update('bankAddress', e.target.value)}
          />
          <MobileInputField
            label="City"
            placeholder="Enter city"
            value={data.bankCity}
            onChange={(e) => update('bankCity', e.target.value)}
          />
          <MobileInputField
            label="Country"
            placeholder="Enter country"
            value={data.bankCountry}
            onChange={(e) => update('bankCountry', e.target.value)}
          />
          <MobileInputField
            label="SWIFT / BIC code"
            placeholder="e.g. BOFAUS3N"
            value={data.swiftCode}
            onChange={(e) => update('swiftCode', e.target.value)}
          />
          <MobileInputField
            label="Account number / IBAN"
            placeholder="Enter account number"
            value={data.bankAccountNumber}
            onChange={(e) => update('bankAccountNumber', e.target.value)}
          />
          <MobileInputField
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
            <label className="flex items-center gap-3 min-h-[44px] cursor-pointer">
              <input
                type="radio"
                name="intermediary"
                checked={data.hasIntermediary}
                onChange={() => update('hasIntermediary', true)}
                className="size-5"
              />
              <span className="text-sm font-medium text-qt-primary">Yes</span>
            </label>
            <label className="flex items-center gap-3 min-h-[44px] cursor-pointer">
              <input
                type="radio"
                name="intermediary"
                checked={!data.hasIntermediary}
                onChange={() => update('hasIntermediary', false)}
                className="size-5"
              />
              <span className="text-sm font-medium text-qt-primary">No</span>
            </label>
          </div>
        </div>

        {data.hasIntermediary && (
          <div className="flex flex-col gap-4 animate-[fadeSlideIn_0.3s_ease-out]">
            <MobileInputField
              label="Intermediary bank name"
              placeholder="Enter intermediary bank name"
              value={data.intermediaryBankName}
              onChange={(e) => update('intermediaryBankName', e.target.value)}
            />
            <MobileInputField
              label="SWIFT / BIC code"
              placeholder="e.g. CHASUS33"
              value={data.intermediarySwiftCode}
              onChange={(e) => update('intermediarySwiftCode', e.target.value)}
            />
            <MobileInputField
              label="Account number"
              placeholder="Enter account number"
              value={data.intermediaryAccountNumber}
              onChange={(e) => update('intermediaryAccountNumber', e.target.value)}
            />
          </div>
        )}
      </div>

      <div className="border-t border-qt-border pt-6">
        <p className="font-semibold text-base text-qt-primary leading-6 mb-3">Brokerage account information</p>
        <p className="text-sm text-qt-secondary mb-4">Only applicable if you are wiring funds to another brokerage.</p>
        <div className="mb-4">
          <p className="text-sm text-qt-secondary mb-3">Are you wiring to another brokerage?</p>
          <div className="flex gap-6">
            <label className="flex items-center gap-3 min-h-[44px] cursor-pointer">
              <input
                type="radio"
                name="is-brokerage"
                checked={data.isBrokerage}
                onChange={() => update('isBrokerage', true)}
                className="size-5"
              />
              <span className="text-sm font-medium text-qt-primary">Yes</span>
            </label>
            <label className="flex items-center gap-3 min-h-[44px] cursor-pointer">
              <input
                type="radio"
                name="is-brokerage"
                checked={!data.isBrokerage}
                onChange={() => update('isBrokerage', false)}
                className="size-5"
              />
              <span className="text-sm font-medium text-qt-primary">No</span>
            </label>
          </div>
        </div>

        {data.isBrokerage && (
          <div className="flex flex-col gap-4 animate-[fadeSlideIn_0.3s_ease-out]">
            <MobileInputField
              label="Brokerage name"
              placeholder="e.g. Fidelity, Charles Schwab"
              value={data.brokerageName}
              onChange={(e) => update('brokerageName', e.target.value)}
            />
            <MobileInputField
              label="Name on brokerage account"
              placeholder="Enter the account holder's name"
              value={data.brokerageAccountName}
              onChange={(e) => update('brokerageAccountName', e.target.value)}
            />
            <MobileInputField
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
