import { useId } from 'react';
import { X } from 'lucide-react';
import type { Currency, InternationalWireData } from '../../types';
import { hasInternationalWireBeneficiaryCore } from '../../lib/internationalWire';
import MobileButton from './MobileButton';
import MobileESignature from './MobileESignature';
import MobileInternationalWireFormBody from './MobileInternationalWireFormBody';

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
        className="flex max-h-[92vh] w-full max-w-[min(100%,var(--mobile-layout-max-width))] flex-col rounded-t-2xl bg-white shadow-2xl sm:rounded-2xl"
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
          <MobileInternationalWireFormBody
            id={id}
            variant="withdrawal"
            data={data}
            onChange={onChange}
            withdrawalCurrency={currency}
            withdrawalAmount={amount}
          />
          <div className="mx-auto mt-4 flex w-full max-w-[357px] flex-col self-center rounded-[length:var(--ads-border-radius-m)] border border-solid border-[var(--ads-color-secondary-400)] bg-[var(--ads-color-elevation-overlay)] p-4">
            <MobileESignature variant="picker" label="Initials" onSign={onSign} signed={signed} />
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
