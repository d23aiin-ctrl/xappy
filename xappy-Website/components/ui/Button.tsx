'use client';

import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { forwardRef } from 'react';
import { cn } from '@/lib/cn';

const buttonVariants = cva(
  'group inline-flex items-center justify-center gap-2.5 font-semibold rounded-xl transition-all duration-400 ease-[cubic-bezier(0.4,0,0.2,1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-blue focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 relative overflow-hidden',
  {
    variants: {
      variant: {
        cta: 'bg-gradient-primary text-white shadow-primary-glow hover:shadow-primary-glow-hover hover:-translate-y-[3px] hover:scale-[1.02] active:scale-[0.98]',
        ctaWhite: 'bg-white text-primary-dark shadow-lg hover:shadow-[0_8px_25px_rgba(0,0,0,0.2)] hover:-translate-y-[3px] hover:scale-[1.02] active:scale-[0.98]',
        contact: 'bg-gradient-primary text-white shadow-primary-glow hover:shadow-primary-glow-hover hover:-translate-y-[2px] active:scale-[0.98]',
        ghost: 'bg-white/15 text-white hover:bg-white/25 shadow-none hover:-translate-y-[2px]',
        learnMore: 'text-primary-blue font-semibold hover:text-primary-dark bg-transparent shadow-none px-0',
        submit: 'w-full bg-gradient-primary text-white shadow-primary-glow hover:shadow-primary-glow-hover hover:-translate-y-[2px] active:scale-[0.98]',
        whatsapp: 'bg-gradient-whatsapp text-white shadow-green-glow hover:shadow-lg hover:-translate-y-[3px] hover:scale-[1.02] active:scale-[0.98]',
        outline: 'border-2 border-primary-blue text-primary-blue bg-transparent hover:bg-primary-blue hover:text-white hover:-translate-y-[2px]',
      },
      size: {
        default: 'px-6 py-3 text-sm',
        lg: 'px-8 py-4 text-base',
        sm: 'px-4 py-2 text-sm',
        icon: 'h-10 w-10 p-0',
      },
    },
    defaultVariants: {
      variant: 'cta',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
