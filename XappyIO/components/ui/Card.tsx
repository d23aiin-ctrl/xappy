import { cn } from '@/lib/cn';

interface CardProps {
  children: React.ReactNode;
  variant?: 'service' | 'info' | 'value' | 'product' | 'industry';
  hover?: boolean;
  className?: string;
}

export function Card({ children, variant = 'service', hover = true, className }: CardProps) {
  const variants = {
    service: 'bg-white rounded-3xl p-8 shadow-card border border-transparent',
    info: 'bg-bg-light rounded-2xl p-6',
    value: 'bg-white rounded-2xl p-6 shadow-card border border-transparent',
    product: 'bg-white rounded-3xl overflow-hidden shadow-card border border-transparent',
    industry: 'bg-white rounded-2xl p-5 shadow-card border border-transparent text-center',
  };

  const hoverClasses = hover
    ? 'transition-all duration-300 hover:shadow-card-hover hover:-translate-y-1.5 hover:border-primary-blue/10'
    : '';

  return (
    <div className={cn(variants[variant], hoverClasses, className)}>
      {children}
    </div>
  );
}

interface CardHeaderProps {
  children: React.ReactNode;
  gradient?: string;
  className?: string;
}

export function CardHeader({ children, gradient, className }: CardHeaderProps) {
  return (
    <div
      className={cn('p-8', className)}
      style={gradient ? { background: gradient } : undefined}
    >
      {children}
    </div>
  );
}

interface CardBodyProps {
  children: React.ReactNode;
  className?: string;
}

export function CardBody({ children, className }: CardBodyProps) {
  return <div className={cn('p-8', className)}>{children}</div>;
}

interface CardIconProps {
  icon: string;
  gradient?: string;
  color?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function CardIcon({ icon, gradient, color, size = 'md', className }: CardIconProps) {
  const sizes = {
    sm: 'w-12 h-12 text-2xl',
    md: 'w-14 h-14 text-3xl',
    lg: 'w-16 h-16 text-4xl',
  };

  return (
    <div
      className={cn(
        'flex items-center justify-center rounded-2xl',
        sizes[size],
        className
      )}
      style={{ background: gradient }}
    >
      <i className={cn(icon, color ? `text-[${color}]` : 'text-white')}></i>
    </div>
  );
}
