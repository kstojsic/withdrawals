/** ZÜM wordmark: green accent bars above the Ü (reference ZUM flow). */
export default function ZumLogo({ className = '' }: { className?: string }) {
  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <span className="flex items-end gap-0.5 text-[17px] font-black tracking-tight text-qt-primary">
        <span>Z</span>
        <span className="relative inline-flex flex-col items-center leading-none">
          <span className="mb-0.5 flex gap-0.5" aria-hidden>
            <span className="h-0.5 w-2 rounded-sm bg-qt-green" />
            <span className="h-0.5 w-2 rounded-sm bg-qt-green" />
          </span>
          <span className="font-black">Ü</span>
        </span>
        <span>M</span>
      </span>
    </div>
  );
}
