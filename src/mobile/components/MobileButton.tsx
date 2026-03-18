import type { ButtonHTMLAttributes, ReactNode } from 'react';

interface MobileButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'text';
  size?: 'sm' | 'md';
  fullWidth?: boolean;
  children: ReactNode;
}

export default function MobileButton({
  variant = 'primary',
  size = 'md',
  fullWidth = true,
  children,
  className = '',
  ...props
}: MobileButtonProps) {
  const base = 'inline-flex items-center justify-center font-semibold rounded-xl transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.99]';

  const variants = {
    primary: 'bg-qt-green text-white active:bg-qt-green-dark',
    secondary: 'border-2 border-qt-gray-dark text-qt-primary active:bg-qt-bg-3',
    text: 'text-qt-green-dark active:underline',
  };

  const sizes = {
    sm: 'min-h-[44px] px-4 text-sm',
    md: 'min-h-[52px] px-6 text-base',
  };

  return (
    <button
      className={`${base} ${variants[variant]} ${sizes[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
