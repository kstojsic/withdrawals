import { useState, useEffect } from 'react';
import type { Currency } from '../../types';
import { formatAmountDisplay, stripFormatting } from '../../data/accounts';

interface MobileBorderlessAmountFieldProps {
  label: string;
  value: string;
  onChange: (raw: string) => void;
  currency: Currency;
  error?: string;
  max?: number;
}

/** Amount entry without a boxed input; Open Sans (inherited); currency suffix. */
export default function MobileBorderlessAmountField({
  label,
  value,
  onChange,
  currency,
  error,
  max,
}: MobileBorderlessAmountFieldProps) {
  const [display, setDisplay] = useState(() => (value ? formatAmountDisplay(value) : ''));
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    if (!focused) setDisplay(value ? formatAmountDisplay(value) : '');
  }, [value, focused]);

  function handleBlur() {
    setFocused(false);
    const raw = stripFormatting(display);
    const num = parseFloat(raw);
    if (raw === '' || Number.isNaN(num)) {
      setDisplay('');
      onChange('');
      return;
    }
    if (max !== undefined && num > max) {
      const capped = max.toString();
      onChange(capped);
      setDisplay(formatAmountDisplay(capped));
      return;
    }
    onChange(raw);
    setDisplay(formatAmountDisplay(raw));
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const v = e.target.value;
    if (v === '' || /^[0-9]*\.?[0-9]*$/.test(v)) {
      setDisplay(v);
      onChange(stripFormatting(v));
    }
  }

  const symbol = currency === 'CAD' ? 'CA$' : 'US$';
  const hasError = !!error || (max !== undefined && (parseFloat(value) || 0) > max);

  return (
    <div className="flex flex-col gap-2">
      <label className="text-center text-sm font-semibold text-qt-primary">{label}</label>
      <div
        className={`flex items-baseline justify-center gap-2 border-b-2 pb-2 transition-colors ${
          hasError ? 'border-qt-red' : focused ? 'border-qt-green' : 'border-qt-border'
        }`}
      >
        <span className="text-xl font-medium text-qt-secondary tabular-nums">{symbol}</span>
        <input
          type="text"
          inputMode="decimal"
          placeholder="0.00"
          value={display}
          onChange={handleChange}
          onFocus={() => {
            setFocused(true);
            setDisplay(stripFormatting(display));
          }}
          onBlur={handleBlur}
          className="min-w-0 max-w-[12rem] flex-1 border-0 bg-transparent p-0 text-center text-3xl font-semibold text-qt-primary outline-none placeholder:text-qt-border placeholder:italic tabular-nums"
          aria-invalid={hasError}
        />
        <span className="text-sm font-bold tracking-wider text-qt-secondary">{currency}</span>
      </div>
      {error && <p className="text-center text-xs font-semibold text-qt-red">{error}</p>}
      {max !== undefined && (parseFloat(value) || 0) > max && (
        <p className="text-center text-xs font-semibold text-qt-red">Amount exceeds available balance.</p>
      )}
    </div>
  );
}
