interface MobileRadioOptionProps {
  name: string;
  value: string;
  label: string;
  checked: boolean;
  onChange: () => void;
}

export default function MobileRadioOption({ name, value, label, checked, onChange }: MobileRadioOptionProps) {
  return (
    <label className="flex items-start gap-3 min-h-[44px] cursor-pointer rounded-xl border-2 border-qt-border bg-white px-4 py-3 has-[:checked]:border-qt-green">
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={onChange}
        className="mt-1 size-5 accent-qt-green cursor-pointer shrink-0"
      />
      <span className="text-sm text-qt-primary leading-[22px]">{label}</span>
    </label>
  );
}
