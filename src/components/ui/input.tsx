import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const inputVariants = cva(
  'flex h-10 w-full rounded-[14px] border px-4 py-2 font-sans text-base transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-brand-mid-gray/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
  {
    variants: {
      variant: {
        dark: 'bg-brand-charcoal border-brand-warm-gray/30 text-brand-cream focus-visible:ring-offset-brand-charcoal',
        light: 'bg-brand-cream border-brand-light-gray text-brand-black focus-visible:ring-offset-brand-cream',
      },
    },
    defaultVariants: {
      variant: 'light',
    },
  }
);

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement>,
    VariantProps<typeof inputVariants> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, variant, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(inputVariants({ variant, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = 'Input';

export { Input, inputVariants };
