/** Simple three-segment progress bar (no numbers or checkmarks). Parent supplies horizontal padding (ADS: 0 var(--ads-size-xxs)). */
export default function MobileThreeStepProgress({ step }: { step: 0 | 1 | 2 }) {
  return (
    <nav className="flex w-full shrink-0 flex-col self-stretch" aria-label="Progress">
      <div className="flex w-full gap-1.5">
        {([0, 1, 2] as const).map((i) => (
          <div
            key={i}
            className={`h-1.5 min-h-[6px] flex-1 rounded-full transition-colors duration-300 ${
              i <= step ? 'bg-qt-green' : 'bg-figma-neutral-100'
            }`}
          />
        ))}
      </div>
    </nav>
  );
}
