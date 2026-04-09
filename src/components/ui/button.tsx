import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap font-sans text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default:
          'bg-brand-gold text-brand-black hover:bg-brand-gold-light active:bg-brand-gold/90',
        outline:
          'border border-brand-gold text-brand-gold bg-transparent hover:bg-brand-gold/10 active:bg-brand-gold/20',
        ghost:
          'bg-transparent text-brand-mid-gray hover:text-brand-gold hover:bg-brand-gold/5 active:bg-brand-gold/10',
        dark:
          'bg-brand-charcoal text-brand-cream hover:bg-brand-warm-gray active:bg-brand-warm-gray/90',
      },
      size: {
        sm: 'h-8 px-3 text-xs',
        default: 'h-10 px-5 text-sm',
        lg: 'h-12 px-8 text-base',
      },
      rounded: {
        pill: 'rounded-full',
        card: 'rounded-[14px]',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
      rounded: 'card',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, rounded, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, rounded, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
