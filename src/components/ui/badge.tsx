import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full px-3 py-0.5 font-sans text-xs font-semibold uppercase tracking-wide transition-colors',
  {
    variants: {
      variant: {
        gold: 'bg-brand-gold/15 text-brand-gold',
        active: 'border border-brand-gold text-brand-gold bg-transparent',
        pending: 'bg-brand-mid-gray/15 text-brand-mid-gray',
        complete: 'bg-brand-gold-light/20 text-brand-gold-light',
        dark: 'bg-brand-charcoal text-brand-cream',
      },
    },
    defaultVariants: {
      variant: 'gold',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(badgeVariants({ variant, className }))}
      {...props}
    />
  )
);
Badge.displayName = 'Badge';

export { Badge, badgeVariants };
