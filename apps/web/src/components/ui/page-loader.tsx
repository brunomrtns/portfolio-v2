import { Loader2 } from 'lucide-react';

export function PageLoader(): React.ReactNode {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--color-bg)]">
      <div className="relative">
        <div className="absolute inset-0 animate-pulse-glow rounded-full bg-[var(--color-accent-glow)] blur-xl" />
        <Loader2 className="relative h-8 w-8 animate-spin text-[var(--color-accent)]" />
      </div>
    </div>
  );
}
