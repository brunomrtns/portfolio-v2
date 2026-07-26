import { type ButtonHTMLAttributes, forwardRef } from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium transition-all duration-300 focus-visible:outline-none max-sm:active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default:
          'bg-[var(--color-surface-elevated)] text-[var(--color-text)] border border-[var(--color-border)] hover:border-[var(--color-border-bright)] hover:bg-[var(--color-surface-hover)]',
        primary:
          'relative overflow-hidden bg-[var(--color-accent)] text-white font-semibold hover:bg-[var(--color-accent-hover)] shadow-[0_0_24px_-4px_var(--color-accent-glow)] hover:shadow-[0_0_40px_-4px_var(--color-accent-glow)]',
        ghost:
          'text-[var(--color-text-secondary)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-elevated)]',
        outline:
          'border border-[var(--color-border)] text-[var(--color-text)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] hover:shadow-[0_0_16px_-4px_var(--color-accent-glow)]',
        gradient:
          'bg-gradient-to-r from-[var(--color-accent)] to-[var(--color-accent-warm)] text-white font-semibold hover:shadow-[0_0_32px_-4px_hsla(172,72%,44%,0.3)]',
      },
      size: {
        default: 'h-10 px-5 py-2 max-sm:h-11',
        sm: 'h-8 px-3.5 text-xs max-sm:h-9',
        lg: 'h-12 px-8 text-base',
        icon: 'h-10 w-10 max-sm:h-11 max-sm:w-11',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = 'Button';
