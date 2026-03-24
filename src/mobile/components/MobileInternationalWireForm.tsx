import { useState } from 'react';
import type { Currency, InternationalWireData } from '../../types';
import { hasInternationalWireBeneficiaryCore } from '../../lib/internationalWire';
import MobileInternationalWireModal from './MobileInternationalWireModal';

interface MobileInternationalWireFormProps {
  currency: Currency;
  amount: string;
  onChange: (data: InternationalWireData) => void;
  data: InternationalWireData;
  signed: boolean;
  /** Called when the user confirms initials in the modal (initials value is passed from the signature control). */
  onSign: (initials: string) => void;
}

const fieldShell =
  'w-full max-w-[357px] rounded-[length:var(--ads-border-radius-m)] border border-solid border-[var(--ads-color-secondary-400)] bg-[var(--ads-color-elevation-overlay)] py-3.5 pl-4 pr-4';

const ctaButton =
  'relative flex w-full max-w-[357px] cursor-pointer items-center justify-center rounded-[length:var(--ads-border-radius-m)] border border-solid border-[var(--ads-color-secondary-400)] bg-[var(--ads-color-elevation-overlay)] py-3.5 px-4 text-left text-sm font-bold leading-snug text-[var(--ads-color-body-contrast-100)] outline-none transition-colors active:border-qt-green active:shadow-sm';

function SummaryLine({ label, value }: { label: string; value: string }) {
  if (!value.trim()) return null;
  return (
    <p className="text-xs font-normal leading-snug text-figma-neutral-200">
      {label}:{' '}
      <span className="font-bold text-[var(--ads-color-body-contrast-100)]">{value}</span>
    </p>
  );
}

export default function MobileInternationalWireForm({
  currency,
  amount,
  onChange,
  data,
  signed,
  onSign,
}: MobileInternationalWireFormProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const coreComplete = hasInternationalWireBeneficiaryCore(data);

  return (
    <>
      <div className="flex w-full max-w-[357px] flex-col gap-2">
        <label className="text-sm font-normal text-figma-neutral-200">International wire</label>
        {coreComplete ? (
          <div className={fieldShell}>
            <p className="mb-2 text-sm font-bold leading-snug text-[var(--ads-color-body-contrast-100)]">
              Receiving bank
            </p>
            <SummaryLine label="Wire currency" value={data.currency} />
            <SummaryLine label="Bank" value={data.bankName} />
            <SummaryLine label="City" value={data.bankCity} />
            <SummaryLine label="Country" value={data.bankCountry} />
            <SummaryLine label="SWIFT / BIC" value={data.swiftCode} />
            <SummaryLine label="Account / IBAN" value={data.bankAccountNumber} />
            <SummaryLine label="Routing number" value={data.routingNumber} />
            {data.hasIntermediary ? (
              <p className="mt-1 text-xs font-normal text-figma-neutral-200">
                Intermediary bank:{' '}
                <span className="font-bold text-[var(--ads-color-body-contrast-100)]">
                  {data.intermediaryBankName?.trim() || 'Yes (details on file)'}
                </span>
              </p>
            ) : (
              <p className="mt-1 text-xs font-normal text-figma-neutral-200">Intermediary bank: No</p>
            )}
            {data.isBrokerage ? (
              <p className="mt-0.5 text-xs font-normal text-figma-neutral-200">
                Brokerage:{' '}
                <span className="font-bold text-[var(--ads-color-body-contrast-100)]">
                  {data.brokerageName?.trim() || 'Yes (details on file)'}
                </span>
              </p>
            ) : (
              <p className="mt-0.5 text-xs font-normal text-figma-neutral-200">Brokerage transfer: No</p>
            )}
            <p className="mt-2 text-xs font-bold text-qt-green-dark">
              {signed ? 'Initials confirmed' : 'Initials not confirmed — open details to sign'}
            </p>
          </div>
        ) : (
          <p className="text-xs font-normal text-figma-neutral-200">
            Enter receiving bank information, intermediary and brokerage options if applicable, and confirm with your
            initials.
          </p>
        )}
        <button type="button" onClick={() => setModalOpen(true)} className={ctaButton}>
          {coreComplete ? 'Edit international wire details' : 'Enter international wire details'}
        </button>
      </div>

      <MobileInternationalWireModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        currency={currency}
        amount={amount}
        data={data}
        onChange={onChange}
        signed={signed}
        onSign={onSign}
      />
    </>
  );
}
