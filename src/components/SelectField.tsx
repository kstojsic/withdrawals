import { ChevronDown } from 'lucide-react';
import type { SelectHTMLAttributes } from 'react';

interface SelectFieldProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  options: { value: string; label: string }[];
  error?: string;
  placeholderText?: string;
}

export default function SelectField({
  label,
  options,
  error,
  placeholderText,
  className = '',
  ...props
}: SelectFieldProps) {
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      <label className="font-semibold text-sm text-qt-primary">{label}</label>
      <div className="relative">
        <select
          className={`w-full h-12 rounded-md border bg-white px-4 pr-10 text-sm leading-[22px] text-qt-primary
            appearance-none outline-none transition-colors cursor-pointer
            ${error
              ? 'border-qt-red focus:border-qt-red'
              : 'border-qt-gray-dark focus:border-qt-green'
            }`}
          {...props}
        >
          {placeholderText && (
            <option value="" disabled>
              {placeholderText}
            </option>
          )}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDown
          size={20}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-qt-secondary pointer-events-none"
        />
      </div>
      {error && <p className="text-sm text-qt-red">{error}</p>}
    </div>
  );
}
