import { type ReactNode } from 'react';

interface MobileShellProps {
  children: ReactNode;
}

export default function MobileShell({ children }: MobileShellProps) {
  return (
    <div className="mx-auto box-border flex h-[100dvh] max-h-[100dvh] min-h-0 w-full max-w-[430px] flex-col bg-qt-bg-2 px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-[max(0.25rem,env(safe-area-inset-top))] font-[family-name:var(--ads-font-family-body)]">
      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-2xl border border-solid border-[var(--ads-color-secondary-400)] bg-[var(--ads-color-elevation-overlay)] shadow-[0_4px_24px_rgba(38,45,51,0.08)]">
        <main className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden overscroll-behavior-y-contain">
          {children}
        </main>
      </div>
    </div>
  );
}
