import type { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'text';
  size?: 'sm' | 'md';
  children: ReactNode;
}

export default function Button({
  variant = 'primary',
  size = 'md',
  children,
  className = '',
  ...props
}: ButtonProps) {
  const base = 'inline-flex items-center justify-center font-semibold rounded-full transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed';

  const variants = {
    primary: 'bg-qt-green text-white hover:bg-qt-green-dark active:bg-qt-green-dark',
    secondary: 'border border-qt-gray-dark text-qt-primary hover:bg-qt-bg-3 active:bg-qt-bg-3',
    text: 'text-qt-green-dark hover:underline',
  };

  const sizes = {
    sm: 'h-8 px-4 text-sm',
    md: 'h-11 px-6 text-base',
  };

  return (
    <button
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
