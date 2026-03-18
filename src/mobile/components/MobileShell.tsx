import { type ReactNode } from 'react';

interface MobileShellProps {
  children: ReactNode;
}

export default function MobileShell({ children }: MobileShellProps) {
  return (
    <div className="min-h-screen flex flex-col bg-qt-white max-w-[430px] mx-auto">
      {/* Minimal mobile header */}
      <header className="flex items-center justify-between h-14 px-4 border-b border-qt-border/50 bg-white shrink-0">
        <img src="/questrade-logo.png" alt="Questrade" className="h-7" />
      </header>

      {/* Main content - scrollable */}
      <main className="flex-1 overflow-y-auto overscroll-behavior-y-contain">
        {children}
      </main>
    </div>
  );
}
