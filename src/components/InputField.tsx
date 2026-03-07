import type { InputHTMLAttributes } from 'react';

interface InputFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  prefix?: string;
}

export default function InputField({
  label,
  error,
  prefix,
  className = '',
  ...props
}: InputFieldProps) {
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      <label className="font-semibold text-sm text-qt-primary">{label}</label>
      <div className="relative">
        {prefix && (
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-qt-secondary text-sm">
            {prefix}
          </span>
        )}
        <input
          className={`w-full h-12 rounded-md border bg-white px-4 text-sm leading-[22px] text-qt-primary
            placeholder:text-qt-secondary placeholder:italic outline-none transition-colors
            ${prefix ? 'pl-8' : ''}
            ${error
              ? 'border-qt-red focus:border-qt-red'
              : 'border-qt-gray-dark focus:border-qt-green'
            }`}
          {...props}
        />
      </div>
      {error && <p className="text-sm font-semibold text-qt-red mt-1">{error}</p>}
    </div>
  );
}
