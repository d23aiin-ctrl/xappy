import { cn } from '@/lib/cn';
import { CSSProperties } from 'react';

interface BadgeProps {
  icon?: string;
  children: React.ReactNode;
  variant?: 'default' | 'white' | 'transparent';
  className?: string;
  style?: CSSProperties;
}

export function Badge({ icon, children, variant = 'default', className, style }: BadgeProps) {
  const variants = {
    default: 'bg-primary-blue/10 text-primary-blue border-primary-blue/20',
    white: 'bg-white/10 text-white border-white/20',
    transparent: 'bg-white/20 text-white border-transparent',
  };

  return (
    <div
      className={cn(
        'inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold border',
        variants[variant],
        className
      )}
      style={style}
    >
      {icon && <i className={icon}></i>}
      <span>{children}</span>
    </div>
  );
}
