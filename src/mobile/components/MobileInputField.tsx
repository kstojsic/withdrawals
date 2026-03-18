import type { InputHTMLAttributes } from 'react';

interface MobileInputFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  prefix?: string;
}

export default function MobileInputField({
  label,
  error,
  prefix,
  className = '',
  ...props
}: MobileInputFieldProps) {
  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <label className="font-semibold text-sm text-qt-primary">{label}</label>
      <div className="relative">
        {prefix && (
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-qt-secondary text-sm">
            {prefix}
          </span>
        )}
        <input
          className={`w-full min-h-[52px] rounded-xl border-2 bg-white px-4 text-base leading-[22px] text-qt-primary
            placeholder:text-qt-secondary placeholder:italic outline-none transition-colors
            ${prefix ? 'pl-10' : ''}
            ${error
              ? 'border-qt-red focus:border-qt-red'
              : 'border-qt-gray-dark focus:border-qt-green'
            }`}
          {...props}
        />
      </div>
      {error && <p className="text-sm font-semibold text-qt-red">{error}</p>}
    </div>
  );
}
