import { X, Check } from 'lucide-react';
import ZumLogo from './ZumLogo';

interface MobileZumManualSuccessProps {
  /** Called when the customer taps the green checkmark — should save the bank and close the flow. */
  onContinue: () => void;
  /** Close without saving (e.g. header X). */
  onClose: () => void;
}

/** Full-screen ZUM-style confirmation after manual bank details are submitted. */
export default function MobileZumManualSuccess({ onContinue, onClose }: MobileZumManualSuccessProps) {
  return (
    <div
      className="fixed inset-0 z-[100] flex justify-center bg-white font-[family-name:var(--font-body)]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="zum-manual-success-title"
      aria-describedby="zum-manual-success-hint"
    >
      <div
        className="flex h-[100svh] max-h-[100svh] min-h-0 w-full max-w-[min(100%,var(--mobile-layout-max-width))] flex-col overflow-hidden pt-[env(safe-area-inset-top,0px)] pb-[env(safe-area-inset-bottom,0px)] pl-[env(safe-area-inset-left,0px)] pr-[env(safe-area-inset-right,0px)]"
      >
        <header className="relative flex h-14 shrink-0 items-center justify-center border-b border-qt-border bg-white">
          <ZumLogo />
          <button
            type="button"
            onClick={onClose}
            className="absolute right-[max(0.5rem,env(safe-area-inset-right))] top-1/2 flex min-h-[44px] min-w-[44px] -translate-y-1/2 items-center justify-center text-qt-secondary active:text-qt-primary"
            aria-label="Close"
          >
            <X size={22} />
          </button>
        </header>

        <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-5 px-6 pb-12">
          <button
            type="button"
            onClick={onContinue}
            className="flex size-[88px] shrink-0 items-center justify-center rounded-full bg-qt-green shadow-[0_8px_24px_rgba(56,155,60,0.35)] outline-none transition-transform focus-visible:ring-2 focus-visible:ring-qt-green focus-visible:ring-offset-2 active:scale-[0.96]"
            aria-label="Continue — return to withdrawal"
          >
            <Check className="size-12 text-white" strokeWidth={3} aria-hidden />
          </button>
          <h2 id="zum-manual-success-title" className="text-center text-lg font-bold text-qt-primary">
            Bank account linked
          </h2>
          <p id="zum-manual-success-hint" className="text-center text-sm text-qt-secondary">
            Tap the checkmark to continue
          </p>
        </div>
      </div>
    </div>
  );
}
