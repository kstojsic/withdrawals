import { Info, AlertTriangle, AlertCircle, CheckCircle2 } from 'lucide-react';
import type { ReactNode } from 'react';

interface InfoBoxProps {
  variant?: 'info' | 'warning' | 'error' | 'success';
  children: ReactNode;
}

export default function InfoBox({ variant = 'info', children }: InfoBoxProps) {
  const styles = {
    info: {
      bg: 'bg-qt-bg-3',
      border: 'border-qt-border',
      icon: <Info size={20} className="text-qt-secondary shrink-0 mt-0.5" />,
    },
    warning: {
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      icon: <AlertTriangle size={20} className="text-amber-600 shrink-0 mt-0.5" />,
    },
    error: {
      bg: 'bg-qt-red-bg',
      border: 'border-qt-red/20',
      icon: <AlertCircle size={20} className="text-qt-red shrink-0 mt-0.5" />,
    },
    success: {
      bg: 'bg-qt-green-bg',
      border: 'border-qt-green-light',
      icon: <CheckCircle2 size={20} className="text-qt-green shrink-0 mt-0.5" />,
    },
  };

  const s = styles[variant];

  return (
    <div className={`flex gap-3 p-4 rounded-md border ${s.bg} ${s.border}`}>
      {s.icon}
      <div className={`text-sm leading-[22px] ${variant === 'success' ? 'text-qt-green-dark' : 'text-qt-primary'}`}>{children}</div>
    </div>
  );
}
