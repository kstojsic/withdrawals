interface RadioButtonProps {
  label: string;
  description?: string;
  checked: boolean;
  onChange: () => void;
  name: string;
  value: string;
  disabled?: boolean;
}

export default function RadioButton({
  label,
  description,
  checked,
  onChange,
  name,
  value,
  disabled = false,
}: RadioButtonProps) {
  return (
    <label
      className={`flex items-start gap-3 group rounded-md focus-within:outline-none ${!disabled ? 'focus-within:ring-2 focus-within:ring-qt-green/50 focus-within:ring-offset-2' : ''} ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
    >
      {/* Native control sits over the visible circle so focus/scroll-into-view does not yank the page (sr-only + iOS). */}
      <div className="relative mt-0.5 shrink-0 size-5">
        <input
          type="radio"
          id={`${name}-${value}`}
          name={name}
          value={value}
          checked={checked}
          disabled={disabled}
          onChange={onChange}
          className="absolute inset-0 z-10 m-0 size-5 cursor-pointer appearance-none opacity-0 disabled:cursor-not-allowed"
        />
        <div
          aria-hidden
          className={`pointer-events-none relative size-5 rounded-full border-2 transition-colors
            ${checked ? 'border-qt-green' : 'border-qt-gray-dark group-hover:border-qt-secondary'}
            ${disabled ? 'group-hover:border-qt-gray-dark' : ''}`}
        >
          {checked && (
            <div className="absolute size-2.5 rounded-full bg-qt-green top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          )}
        </div>
      </div>
      <div>
        <p className={`text-base leading-6 ${checked ? 'font-semibold text-qt-primary' : 'text-qt-primary'}`}>
          {label}
        </p>
        {description && (
          <p className="text-sm leading-[22px] text-qt-secondary mt-0.5">{description}</p>
        )}
      </div>
    </label>
  );
}
