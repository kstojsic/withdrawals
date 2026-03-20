import { useState, useRef, useEffect } from 'react';
import { Info } from 'lucide-react';

/** Tap-friendly tooltip for mobile (desktop hover still works). */
export default function MobileInfoTooltip({ content }: { content: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!open) return;
    function close(e: MouseEvent | TouchEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', close);
    document.addEventListener('touchstart', close);
    return () => {
      document.removeEventListener('mousedown', close);
      document.removeEventListener('touchstart', close);
    };
  }, [open]);

  return (
    <span ref={ref} className="relative inline-flex items-center align-middle">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="inline-flex min-h-8 min-w-8 items-center justify-center rounded-full text-qt-gray-dark active:bg-qt-bg-3 cursor-pointer"
        aria-expanded={open}
        aria-label="More information"
      >
        <Info size={16} className="shrink-0" />
      </button>
      {open && (
        <span className="absolute bottom-full left-1/2 z-50 mb-2 w-[min(16rem,calc(100vw-2rem))] -translate-x-1/2 rounded-lg bg-qt-primary p-3 text-left text-xs leading-snug text-white shadow-lg">
          {content}
          <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-qt-primary" />
        </span>
      )}
    </span>
  );
}
