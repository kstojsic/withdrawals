import { useState } from 'react';

interface ESignatureProps {
  onSign: (value: string) => void;
  signed: boolean;
  label?: string;
}

export default function ESignature({ onSign, signed, label = 'Confirmation' }: ESignatureProps) {
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
          value={signed ? initials : initials}
          onChange={(e) => { if (!signed) setInitials(e.target.value.toUpperCase()); }}
          placeholder="e.g. AC"
          maxLength={5}
          disabled={signed}
          className={`w-28 h-12 rounded-md border-2 px-4 text-center text-lg font-bold tracking-widest uppercase outline-none transition-colors
            ${signed
              ? 'border-qt-green bg-qt-green-bg/30 text-qt-green-dark'
              : 'border-qt-border focus:border-qt-green bg-white text-qt-primary'
            }`}
        />
        {initials.trim().length > 0 && !signed && (
          <button
            type="button"
            onClick={handleConfirm}
            className="h-10 px-4 rounded-md bg-qt-green text-white text-sm font-semibold cursor-pointer hover:bg-qt-green-dark transition-colors"
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
