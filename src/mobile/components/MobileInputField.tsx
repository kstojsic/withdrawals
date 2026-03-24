import type { InputHTMLAttributes } from 'react';

/** `picker` matches `MobileAccountDropdown` / `MobileBankDepositDropdown` field styling. */
interface MobileInputFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  prefix?: string;
  variant?: 'default' | 'picker';
}

export default function MobileInputField({
  label,
  error,
  prefix,
  variant = 'default',
  className = '',
  ...props
}: MobileInputFieldProps) {
  const labelClass =
    variant === 'picker'
      ? 'text-sm font-normal text-figma-neutral-200'
      : 'font-semibold text-sm text-qt-primary';

  const inputClass =
    variant === 'picker'
      ? `w-full min-h-[52px] rounded-[length:var(--ads-border-radius-m)] border border-solid bg-[var(--ads-color-elevation-overlay)] px-4 text-sm font-bold leading-snug text-[var(--ads-color-body-contrast-100)] outline-none transition-colors placeholder:font-normal placeholder:italic placeholder:text-figma-neutral-200 ${
          error
            ? 'border-qt-red focus:border-qt-red'
            : 'border-[var(--ads-color-secondary-400)] focus:border-qt-green focus:shadow-sm'
        }`
      : `w-full min-h-[52px] rounded-xl border-2 bg-white px-4 text-base leading-[22px] text-qt-primary
            placeholder:text-qt-secondary placeholder:italic outline-none transition-colors
            ${error ? 'border-qt-red focus:border-qt-red' : 'border-qt-gray-dark focus:border-qt-green'}`;

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <label className={labelClass}>{label}</label>
      <div className="relative">
        {prefix && (
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-qt-secondary">
            {prefix}
          </span>
        )}
        <input
          className={`${inputClass} ${prefix ? 'pl-10' : ''}`}
          {...props}
        />
      </div>
      {error && <p className="text-sm font-semibold text-qt-red">{error}</p>}
    </div>
  );
}
