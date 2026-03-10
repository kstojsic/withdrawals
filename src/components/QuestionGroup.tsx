import type { ReactNode } from 'react';

interface QuestionGroupProps {
  title: string;
  subtitle?: string;
  step?: number;
  totalSteps?: number;
  children: ReactNode;
}

export default function QuestionGroup({ title, subtitle, step, totalSteps, children }: QuestionGroupProps) {
  return (
    <div className="border border-qt-border rounded-xl overflow-hidden animate-[fadeSlideIn_0.3s_ease-out]">
      <div className="bg-qt-bg-3 px-5 py-3 border-b border-qt-border flex items-center justify-between">
        <p className="font-semibold text-sm text-qt-primary">{title}</p>
        {step != null && totalSteps != null && (
          <span className="text-xs text-qt-secondary font-semibold">
            Step {step} of {totalSteps}
          </span>
        )}
      </div>
      {subtitle && (
        <p className="text-xs text-qt-secondary px-5 pt-4 leading-relaxed">{subtitle}</p>
      )}
      <div className="px-5 py-5 flex flex-col gap-6">
        {children}
      </div>
    </div>
  );
}
