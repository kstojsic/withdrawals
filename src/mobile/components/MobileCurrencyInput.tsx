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
  /** Larger centered field for primary amount entry */
  variant?: 'default' | 'hero';
}

export default function MobileCurrencyInput({
  label,
  value,
  onChange,
  error,
  max,
  maxLabel,
  disabled,
  variant = 'default',
}: MobileCurrencyInputProps) {
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
  const isHero = variant === 'hero';

  return (
    <div className={`flex flex-col gap-1 ${isHero ? 'items-stretch' : ''}`}>
      <label
        className={`font-semibold text-qt-primary ${isHero ? 'text-center text-sm text-[#333333]' : 'text-sm'}`}
      >
        {label}
      </label>
      <div className="relative">
        <span
          className={`absolute top-1/2 -translate-y-1/2 text-qt-secondary ${isHero ? 'left-3.5 text-lg font-semibold' : 'left-4 text-base'}`}
        >
          $
        </span>
        <input
          type="text"
          inputMode="decimal"
          placeholder="0.00"
          value={display}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          disabled={disabled}
          className={`w-full rounded-xl border-2 bg-white text-qt-primary placeholder:text-qt-secondary placeholder:italic outline-none transition-colors
            ${isHero
              ? `min-h-[52px] pl-11 pr-4 text-center text-2xl font-semibold tracking-tight ${hasError ? 'border-qt-red focus:border-qt-red' : 'border-qt-gray-dark focus:border-qt-green'}`
              : `min-h-[48px] pl-10 pr-4 text-base leading-[22px] ${hasError ? 'border-qt-red focus:border-qt-red' : 'border-qt-gray-dark focus:border-qt-green'}`
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
