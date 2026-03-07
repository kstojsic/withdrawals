import { useEffect, useRef, type ReactNode } from 'react';

interface WizardSectionProps {
  visible: boolean;
  children: ReactNode;
  animate?: boolean;
}

export default function WizardSection({ visible, children, animate = true }: WizardSectionProps) {
  const ref = useRef<HTMLDivElement>(null);
  const mounted = useRef(false);

  useEffect(() => {
    if (visible && animate && mounted.current && ref.current) {
      ref.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    if (visible) mounted.current = true;
  }, [visible, animate]);

  if (!visible) return null;

  return (
    <div
      ref={ref}
      className="animate-[fadeSlideIn_0.4s_ease-out] scroll-mt-6"
    >
      {children}
    </div>
  );
}
