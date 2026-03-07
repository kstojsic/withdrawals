import { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { accounts } from '../data/accounts';
import type { Account } from '../types';

interface AccountDropdownProps {
  value: string | null;
  onChange: (account: Account) => void;
}

export default function AccountDropdown({ value, onChange }: AccountDropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const selected = accounts.find((a) => a.id === value);

  return (
    <div className="flex flex-col gap-1" ref={ref}>
      <label className="font-semibold text-sm text-qt-primary">Select account</label>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`relative w-full h-12 rounded-md border bg-white px-4 pr-10 text-left text-sm text-qt-primary
          outline-none transition-colors cursor-pointer flex items-center gap-2
          ${open ? 'border-qt-green' : 'border-qt-gray-dark'}`}
      >
        {selected ? (
          <span className="text-xs font-bold tracking-wider uppercase">
            {selected.label} - {selected.accountNumber}
          </span>
        ) : (
          <span className="text-qt-secondary italic">Choose an account...</span>
        )}
        <ChevronDown
          size={20}
          className={`absolute right-3 top-1/2 -translate-y-1/2 text-qt-secondary transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {open && (
        <div className="border border-qt-border rounded-md bg-white shadow-lg overflow-hidden animate-[fadeSlideIn_0.15s_ease-out]">
          {accounts.map((a) => (
            <button
              key={a.id}
              type="button"
              onClick={() => { onChange(a); setOpen(false); }}
              className={`w-full px-4 py-3 text-left cursor-pointer transition-colors
                ${value === a.id ? 'bg-qt-green-bg/30' : 'hover:bg-qt-bg-3'}`}
            >
              <span className="text-xs font-bold tracking-wider uppercase text-qt-primary">
                {a.label} - {a.accountNumber}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
