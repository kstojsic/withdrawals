import { useState } from 'react';

interface MobileESignatureProps {
  onSign: (value: string) => void;
  signed: boolean;
  label?: string;
  /** Align with account/bank picker fields (`MobileInputField` picker variant). */
  variant?: 'default' | 'picker';
}

export default function MobileESignature({
  onSign,
  signed,
  label = 'Confirmation',
  variant = 'default',
}: MobileESignatureProps) {
  const [initials, setInitials] = useState('');

  function handleConfirm() {
    if (initials.trim().length > 0) {
      onSign(initials.trim());
    }
  }

  const isPicker = variant === 'picker';

  return (
    <div>
      <p
        className={
          isPicker
            ? 'mb-2 text-sm font-normal text-figma-neutral-200'
            : 'mb-2 text-sm leading-[22px] text-qt-primary'
        }
      >
        {label}
      </p>
      <p
        className={
          isPicker ? 'mb-3 text-xs font-normal text-figma-neutral-200' : 'mb-3 text-xs text-qt-secondary'
        }
      >
        Type in your initials to confirm
      </p>
      <div className="flex items-center gap-3">
        <input
          type="text"
          value={initials}
          onChange={(e) => {
            if (!signed) setInitials(e.target.value.toUpperCase());
          }}
          placeholder="e.g. AC"
          maxLength={5}
          disabled={signed}
          className={`min-h-[52px] min-w-[100px] px-4 text-center text-lg font-bold uppercase tracking-widest outline-none transition-colors ${
            isPicker
              ? signed
                ? 'rounded-[length:var(--ads-border-radius-m)] border border-solid border-qt-green bg-qt-green-bg/30 text-qt-green-dark'
                : 'rounded-[length:var(--ads-border-radius-m)] border border-solid border-[var(--ads-color-secondary-400)] bg-[var(--ads-color-elevation-overlay)] text-[var(--ads-color-body-contrast-100)] placeholder:italic placeholder:text-figma-neutral-200 focus:border-qt-green focus:shadow-sm'
              : signed
                ? 'rounded-xl border-2 border-qt-green bg-qt-green-bg/30 text-qt-green-dark'
                : 'rounded-xl border-2 border-qt-border bg-white text-qt-primary focus:border-qt-green'
          }`}
        />
        {initials.trim().length > 0 && !signed && (
          <button
            type="button"
            onClick={handleConfirm}
            className={`min-h-[52px] px-6 bg-qt-green text-base font-semibold text-white transition-colors active:bg-qt-green-dark ${
              isPicker
                ? 'cursor-pointer rounded-[length:var(--ads-border-radius-m)]'
                : 'cursor-pointer rounded-xl'
            }`}
          >
            Confirm
          </button>
        )}
        {signed && (
          <span className="text-sm font-semibold text-qt-green-dark">Confirmed</span>
        )}
      </div>
    </div>
  );
}
