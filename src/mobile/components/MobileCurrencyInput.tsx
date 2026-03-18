import { useState, useEffect } from 'react';
import { formatAmountDisplay, stripFormatting } from '../../data/accounts';

interface MobileCurrencyInputProps {
  label: string;
  value: string;
  onChange: (rawValue: string) => void;
  error?: string;
  max?: number;
  maxLabel?: string;
  disabled?: boolean;
}

export default function MobileCurrencyInput({ label, value, onChange, error, max, maxLabel, disabled }: MobileCurrencyInputProps) {
  const [display, setDisplay] = useState(() => value ? formatAmountDisplay(value) : '');
  const [focused, setFocused] = useState(false);
  const [exceeded, setExceeded] = useState(false);

  useEffect(() => {
    if (!focused) {
      setDisplay(value ? formatAmountDisplay(value) : '');
    }
  }, [value, focused]);

  useEffect(() => {
    if (max !== undefined) {
      const num = parseFloat(value) || 0;
      setExceeded(num > max);
    } else {
      setExceeded(false);
    }
  }, [value, max]);

  function handleFocus() {
    setFocused(true);
    setDisplay(stripFormatting(display));
  }

  function handleBlur() {
    setFocused(false);
    const raw = stripFormatting(display);
    const num = parseFloat(raw);
    if (isNaN(num) || raw === '') {
      setDisplay('');
      onChange('');
      return;
    }
    if (max !== undefined && num > max) {
      const finalRaw = max.toString();
      onChange(finalRaw);
      setDisplay(formatAmountDisplay(finalRaw));
      setExceeded(false);
      return;
    }
    onChange(raw);
    setDisplay(formatAmountDisplay(raw));
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const v = e.target.value;
    if (v === '' || /^[0-9]*\.?[0-9]*$/.test(v)) {
      setDisplay(v);
      const raw = stripFormatting(v);
      onChange(raw);
    }
  }

  const showExceeded = exceeded && max !== undefined;
  const hasError = !!error || showExceeded;

  return (
    <div className="flex flex-col gap-2">
      <label className="font-semibold text-sm text-qt-primary">{label}</label>
      <div className="relative">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-qt-secondary text-base">$</span>
        <input
          type="text"
          inputMode="decimal"
          placeholder="0.00"
          value={display}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          disabled={disabled}
          className={`w-full min-h-[52px] rounded-xl border-2 bg-white pl-10 pr-4 text-base leading-[22px] text-qt-primary
            placeholder:text-qt-secondary placeholder:italic outline-none transition-colors
            ${hasError
              ? 'border-qt-red focus:border-qt-red'
              : 'border-qt-gray-dark focus:border-qt-green'
            }
            ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
        />
      </div>
      {showExceeded && (
        <p className="text-sm font-semibold text-qt-red">
          Your request has exceeded the limit{maxLabel ? ` of ${maxLabel}` : ''}
        </p>
      )}
      {error && !showExceeded && <p className="text-sm font-semibold text-qt-red">{error}</p>}
    </div>
  );
}
