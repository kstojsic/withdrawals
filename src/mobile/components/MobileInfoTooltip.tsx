import { useState, useRef, useEffect, useLayoutEffect, useCallback, type CSSProperties } from 'react';
import { createPortal } from 'react-dom';
import { Info } from 'lucide-react';

type TooltipPlacement = 'top' | 'bottom';
/** `button` = centered under the icon (can clip on narrow screens). `viewport` = same vertical anchor, but panel centered left-to-right on the screen. */
type HorizontalAlign = 'button' | 'viewport';

/** Tap-friendly tooltip for mobile; uses a fixed portal so parent overflow does not clip it. */
export default function MobileInfoTooltip({
  content,
  placement = 'top',
  horizontalAlign = 'button',
}: {
  content: string;
  placement?: TooltipPlacement;
  horizontalAlign?: HorizontalAlign;
}) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLSpanElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [panelStyle, setPanelStyle] = useState<CSSProperties | null>(null);

  const updatePosition = useCallback(() => {
    if (!open || !wrapperRef.current) return;
    const btn = wrapperRef.current.querySelector('button');
    if (!btn) return;
    const r = btn.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    /** Viewport mode: almost full-width panel, shifted slightly right (toward the ℹ) but clamped so it stays on-screen. */
    const horizontal: CSSProperties =
      horizontalAlign === 'viewport'
        ? (() => {
            const w = Math.min(352, vw - 32);
            const nudgeFromScreenCenterPx = 28;
            const desiredCenter = vw / 2 + nudgeFromScreenCenterPx;
            const centerClamped = Math.min(
              Math.max(desiredCenter, w / 2 + 12),
              vw - w / 2 - 12,
            );
            return {
              left: centerClamped,
              transform: 'translateX(-50%)',
              width: w,
              maxWidth: vw - 32,
            };
          })()
        : {
            left: r.left + r.width / 2,
            transform: 'translateX(-50%)',
            width: Math.min(320, vw - 32),
            maxWidth: 'calc(100vw - 2rem)',
          };

    const base: CSSProperties = {
      position: 'fixed',
      zIndex: 9999,
      ...horizontal,
      boxSizing: 'border-box',
    };

    if (horizontalAlign === 'viewport') {
      const spaceBelow = vh - r.bottom - 8;
      base.maxHeight = Math.min(vh * 0.5, Math.max(160, spaceBelow - 12));
      base.overflowY = 'auto';
      base.WebkitOverflowScrolling = 'touch';
    }

    if (placement === 'bottom') {
      setPanelStyle({ ...base, top: r.bottom + 8 });
    } else {
      setPanelStyle({
        ...base,
        bottom: vh - r.top + 8,
      });
    }
  }, [open, placement, horizontalAlign]);

  useLayoutEffect(() => {
    if (!open) {
      setPanelStyle(null);
      return;
    }
    updatePosition();
    window.addEventListener('scroll', updatePosition, true);
    window.addEventListener('resize', updatePosition);
    return () => {
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
    };
  }, [open, updatePosition]);

  useEffect(() => {
    if (!open) return;
    function close(e: MouseEvent | TouchEvent) {
      const t = e.target as Node;
      if (wrapperRef.current?.contains(t)) return;
      if (panelRef.current?.contains(t)) return;
      setOpen(false);
    }
    document.addEventListener('mousedown', close);
    document.addEventListener('touchstart', close);
    return () => {
      document.removeEventListener('mousedown', close);
      document.removeEventListener('touchstart', close);
    };
  }, [open]);

  const panelClass =
    'rounded-lg bg-qt-primary p-3 text-left text-xs leading-snug text-white shadow-lg';

  return (
    <span ref={wrapperRef} className="relative inline-flex items-center align-middle">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="inline-flex min-h-8 min-w-8 items-center justify-center rounded-full text-qt-gray-dark active:bg-qt-bg-3 cursor-pointer"
        aria-expanded={open}
        aria-label="More information"
      >
        <Info size={16} className="shrink-0" />
      </button>
      {open &&
        panelStyle &&
        typeof document !== 'undefined' &&
        createPortal(
          <div ref={panelRef} style={panelStyle} className={panelClass} role="tooltip">
            {content}
          </div>,
          document.body,
        )}
    </span>
  );
}
