import { type InputHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

export type InputProps = InputHTMLAttributes<HTMLInputElement>;

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          'flex h-11 w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)]/60 px-4 py-2.5 text-sm text-[var(--color-text)] backdrop-blur-sm transition-all duration-300',
          'placeholder:text-[var(--color-text-muted)]',
          'hover:border-[var(--color-border-bright)]',
          'focus-visible:outline-none focus-visible:border-[var(--color-accent)] focus-visible:shadow-[0_0_0_3px_var(--color-accent-glow)] focus-visible:bg-[var(--color-bg)]',
          'disabled:cursor-not-allowed disabled:opacity-50',
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = 'Input';
