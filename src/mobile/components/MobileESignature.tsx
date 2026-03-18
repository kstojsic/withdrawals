import { useState } from 'react';

interface MobileESignatureProps {
  onSign: (value: string) => void;
  signed: boolean;
  label?: string;
}

export default function MobileESignature({ onSign, signed, label = 'Confirmation' }: MobileESignatureProps) {
  const [initials, setInitials] = useState('');

  function handleConfirm() {
    if (initials.trim().length > 0) {
      onSign(initials.trim());
    }
  }

  return (
    <div>
      <p className="text-sm leading-[22px] text-qt-primary mb-2">{label}</p>
      <p className="text-xs text-qt-secondary mb-3">Type in your initials to confirm</p>
      <div className="flex items-center gap-3">
        <input
          type="text"
          value={initials}
          onChange={(e) => { if (!signed) setInitials(e.target.value.toUpperCase()); }}
          placeholder="e.g. AC"
          maxLength={5}
          disabled={signed}
          className={`min-w-[100px] min-h-[52px] rounded-xl border-2 px-4 text-center text-lg font-bold tracking-widest uppercase outline-none transition-colors
            ${signed
              ? 'border-qt-green bg-qt-green-bg/30 text-qt-green-dark'
              : 'border-qt-border focus:border-qt-green bg-white text-qt-primary'
            }`}
        />
        {initials.trim().length > 0 && !signed && (
          <button
            type="button"
            onClick={handleConfirm}
            className="min-h-[52px] px-6 rounded-xl bg-qt-green text-white text-base font-semibold cursor-pointer active:bg-qt-green-dark transition-colors"
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
