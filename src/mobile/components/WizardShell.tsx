import type { ReactNode } from 'react';
import { ChevronLeft } from 'lucide-react';
import MobileButton from './MobileButton';

export type WizardShellBackPlacement = 'footer' | 'topLeft';

export interface WizardShellProps {
  /** 0-based index for progress label/bar */
  stepIndex: number;
  totalSteps: number;
  showBack?: boolean;
  /** Default `footer` (full-width bar). `topLeft` hides footer back and shows a compact control on the progress header. */
  backPlacement?: WizardShellBackPlacement;
  onBack: () => void;
  onPrimary: () => void;
  primaryLabel: string;
  primaryDisabled?: boolean;
  hideFooter?: boolean;
  footerExtra?: ReactNode;
  children: ReactNode;
}

export default function WizardShell({
  stepIndex,
  totalSteps,
  showBack: showBackProp,
  backPlacement = 'footer',
  onBack,
  onPrimary,
  primaryLabel,
  primaryDisabled = false,
  hideFooter = false,
  footerExtra,
  children,
}: WizardShellProps) {
  const displayStep = totalSteps > 0 ? stepIndex + 1 : 0;
  const progressPct = totalSteps > 0 ? ((stepIndex + 1) / totalSteps) * 100 : 0;
  const showBack = showBackProp ?? stepIndex > 0;
  const footerBack = showBack && backPlacement === 'footer';

  return (
    <div className="flex flex-col h-full min-h-0 flex-1 w-full max-w-full overflow-hidden">
      {totalSteps > 0 && (
        <div className="relative shrink-0 bg-white px-3 pb-1 pt-1.5">
          {showBack && backPlacement === 'topLeft' && (
            <button
              type="button"
              onClick={onBack}
              className="absolute left-1.5 top-1 z-10 flex size-8 items-center justify-center rounded-full text-[#333333] active:bg-[#F8F8FA] cursor-pointer"
              aria-label="Back"
            >
              <ChevronLeft className="size-[18px]" strokeWidth={2.25} aria-hidden />
            </button>
          )}
          <p className="mb-0.5 text-center text-[10px] font-semibold text-[#78899F]">
            Step {displayStep} of {totalSteps}
          </p>
          <div
            className="h-0.5 bg-[#E5E7EB] rounded-full overflow-hidden"
            role="progressbar"
            aria-valuenow={displayStep}
            aria-valuemin={1}
            aria-valuemax={totalSteps}
          >
            <div
              className="h-full bg-[#389B3C] rounded-full transition-[width] duration-300 ease-out"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col min-h-0 overflow-hidden px-2 py-1">
        <div className="flex-1 flex flex-col min-h-0 overflow-y-auto overflow-x-hidden overscroll-contain [-webkit-overflow-scrolling:touch]">
          {children}
        </div>
      </div>

      {(!hideFooter || footerBack || footerExtra) && (
        <div className="shrink-0 mt-auto border-t border-[#E5E7EB] px-3 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] bg-white shadow-[0_-4px_16px_rgba(0,0,0,0.06)] space-y-1.5">
          {footerExtra}
          {!hideFooter && (
            <MobileButton size="sm" onClick={onPrimary} disabled={primaryDisabled}>
              {primaryLabel}
            </MobileButton>
          )}
          {footerBack && (
            <button
              type="button"
              onClick={onBack}
              className="w-full min-h-[40px] rounded-full border border-[#666666] text-[#333333] font-semibold text-sm bg-white active:bg-[#F8F8FA] cursor-pointer"
            >
              Back
            </button>
          )}
        </div>
      )}
    </div>
  );
}
