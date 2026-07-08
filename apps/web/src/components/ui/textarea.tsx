import { type TextareaHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

export type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement>;

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          'flex min-h-[120px] w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 text-sm text-[var(--color-text)] transition-colors duration-300',
          'placeholder:text-[var(--color-text-muted)]',
          'focus-visible:outline-none focus-visible:border-[var(--color-accent)] focus-visible:shadow-[0_0_12px_var(--color-accent-glow)]',
          'disabled:cursor-not-allowed disabled:opacity-50',
          'resize-y',
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Textarea.displayName = 'Textarea';
