import React from 'react';
import Link from 'next/link';

type ButtonProps = {
  href?: string;
  variant?: 'solid' | 'outline' | 'ghost';
  size?: 'md' | 'lg';
  className?: string;
  children: React.ReactNode;
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

export function Button({
  href,
  variant = 'solid',
  size = 'md',
  className = '',
  children,
  ...rest
}: ButtonProps) {
  const base = 'inline-flex items-center justify-center gap-2 rounded uppercase tracking-wide2 font-semibold transition-colors';

  const sizes = {
    md: 'px-6 py-3 text-xs',
    lg: 'px-8 py-4 text-sm',
  };

  const variants = {
    solid: 'bg-amber text-ink hover:bg-amber-soft',
    outline: 'border border-amber text-amber hover:bg-amber hover:text-ink',
    ghost: 'text-amber hover:text-amber-soft',
  };

  const classes = `${base} ${sizes[size]} ${variants[variant]} ${className}`;

  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button className={classes} {...rest}>
      {children}
    </button>
  );
}
