interface RadioButtonProps {
  label: string;
  description?: string;
  checked: boolean;
  onChange: () => void;
  name: string;
  value: string;
}

export default function RadioButton({
  label,
  description,
  checked,
  onChange,
  name,
  value,
}: RadioButtonProps) {
  return (
    <label className="flex items-start gap-3 cursor-pointer group" htmlFor={`${name}-${value}`}>
      <input
        type="radio"
        id={`${name}-${value}`}
        name={name}
        value={value}
        checked={checked}
        onChange={onChange}
        className="sr-only"
      />
      <div className="mt-0.5 shrink-0">
        <div
          className={`relative size-5 rounded-full border-2 transition-colors
            ${checked ? 'border-qt-green' : 'border-qt-gray-dark group-hover:border-qt-secondary'}`}
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
