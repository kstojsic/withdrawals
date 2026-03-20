import type { ReactNode } from 'react';

type Variant = 'default' | 'warning';

export default function MobileInfoBox({ variant = 'default', children }: { variant?: Variant; children: ReactNode }) {
  const styles =
    variant === 'warning'
      ? 'border-amber-300 bg-amber-50 text-amber-900'
      : 'border-qt-border bg-qt-bg-3 text-qt-primary';

  return (
    <div className={`rounded-lg border-2 px-2.5 py-2 text-xs leading-snug ${styles}`}>{children}</div>
  );
}
