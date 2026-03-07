interface TopNavProps {
  onExit?: () => void;
  showExit?: boolean;
}

export default function TopNav({ onExit, showExit = false }: TopNavProps) {
  return (
    <header className="flex items-center justify-between h-[64px] px-6 bg-qt-white border-b border-qt-border/50 shrink-0">
      <img src="/questrade-logo.png" alt="Questrade" className="h-9 w-auto" />

      {showExit && (
        <button
          onClick={onExit}
          className="font-semibold text-sm text-qt-primary hover:text-qt-secondary transition-colors cursor-pointer"
        >
          Exit
        </button>
      )}
    </header>
  );
}
