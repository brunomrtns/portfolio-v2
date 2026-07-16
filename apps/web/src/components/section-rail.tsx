import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform, animate } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';

const SECTIONS = [
  { id: 'sobre', labelKey: 'nav.sobre' },
  { id: 'solucoes', labelKey: 'nav.solucoes' },
  { id: 'produtos', labelKey: 'nav.produtos' },
  { id: 'experiencia', labelKey: 'nav.experiencia' },
  { id: 'educacao', labelKey: 'nav.educacao' },
  { id: 'stack', labelKey: 'nav.stack' },
  { id: 'portfolio', labelKey: 'nav.portfolio' },
  { id: 'principios', labelKey: 'nav.principios' },
  { id: 'contato', labelKey: 'nav.contato' },
] as const;

export function SectionRail(): React.ReactNode {
  const { t } = useTranslation();
  const [activeId, setActiveId] = useState<string>('');
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [railHovered, setRailHovered] = useState(false);
  const railRef = useRef<HTMLDivElement>(null);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cancelHide = () => {
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }
  };

  const scheduleHide = () => {
    cancelHide();
    hideTimerRef.current = setTimeout(() => {
      setRailHovered(false);
      setHoveredId(null);
    }, 200);
  };

  // Track active section via IntersectionObserver
  useEffect(() => {
    const observers: IntersectionObserver[] = [];

    SECTIONS.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (!el) return;

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) setActiveId(id);
          });
        },
        { rootMargin: '-40% 0px -50% 0px', threshold: 0 },
      );

      observer.observe(el);
      observers.push(observer);
    });

    return () => {
      observers.forEach((o) => o.disconnect());
      cancelHide();
    };
  }, []);

  const handleClick = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const activeIndex = SECTIONS.findIndex((s) => s.id === activeId);
  const progress = activeIndex >= 0 ? activeIndex / (SECTIONS.length - 1) : 0;

  return (
    <motion.nav
      initial={{ opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.9, delay: 1.4, ease: [0.16, 1, 0.3, 1] }}
      className="fixed right-7 top-1/2 z-40 hidden -translate-y-1/2 xl:block"
      aria-label="Section navigation"
    >
      <div
        ref={railRef}
        className="relative flex flex-col items-end gap-0 py-2"
        onMouseEnter={() => { cancelHide(); setRailHovered(true); }}
        onMouseLeave={() => scheduleHide()}
      >
        {/* Track — full background line */}
        <div className="absolute right-[19px] top-5 bottom-5 w-px bg-[var(--color-border)]" />

        {/* Progress fill — animated to active position */}
        <motion.div
          className="absolute right-[19px] top-5 w-px bg-gradient-to-b from-[var(--color-accent)] to-[var(--color-accent-glow)]"
          animate={{ height: `calc(${progress} * 100% )` }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          style={{ height: `${progress * 100}%` }}
        />

        {SECTIONS.map(({ id, labelKey }, index) => {
          const isActive = activeId === id;
          const isHovered = hoveredId === id;
          const isPast = activeIndex >= 0 && index < activeIndex;

          return (
            <button
              key={id}
              onClick={() => handleClick(id)}
              onMouseEnter={() => { cancelHide(); setHoveredId(id); }}
              onMouseLeave={() => setHoveredId(null)}
              className="group relative flex h-10 w-10 items-center justify-center"
              aria-label={t(labelKey)}
              aria-current={isActive ? 'true' : undefined}
            >
              {/* Invisible bridge — extends hover/click area to cover tooltip gap */}
              <div className="absolute right-0 top-0 h-full w-12" />

              {/* Tooltip — glass pill, slides in from right */}
              <AnimatePresence>
                {(isHovered || railHovered) && (
                  <motion.span
                    initial={{ opacity: 0, x: 8, scale: 0.95 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={{ opacity: 0, x: 6, scale: 0.95 }}
                    transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1], delay: isHovered ? 0 : index * 0.03 }}
                    onMouseEnter={() => cancelHide()}
                    className={cn(
                      'absolute right-12 whitespace-nowrap rounded-lg border border-[var(--color-border-glow)] bg-[var(--color-surface-glass)] px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.14em] backdrop-blur-xl elevation-2 transition-all cursor-pointer hover:border-[var(--color-accent)]/40 hover:bg-[var(--color-surface)]',
                      isHovered
                        ? 'text-[var(--color-text)]'
                        : 'text-[var(--color-text-muted)]',
                    )}
                  >
                    {t(labelKey)}
                  </motion.span>
                )}
              </AnimatePresence>

              {/* Node — the marker on the line */}
              <motion.span
                animate={{
                  scale: isActive ? 1 : isHovered ? 1.15 : 1,
                }}
                transition={{ duration: 0.3, ease: [0.34, 1.56, 0.64, 1] }}
                className={cn(
                  'relative z-10 rounded-full transition-all duration-500',
                  isActive
                    ? 'h-2.5 w-2.5 bg-[var(--color-accent)] shadow-[0_0_14px_-2px_var(--color-accent-glow-strong)]'
                    : isPast
                      ? 'h-1.5 w-1.5 bg-[var(--color-accent)]/40'
                      : 'h-1.5 w-1.5 bg-[var(--color-text-muted)]/40 group-hover:bg-[var(--color-text-secondary)]/70',
                )}
              >
                {/* Active pulse ring */}
                {isActive && (
                  <motion.span
                    initial={{ scale: 1, opacity: 0.6 }}
                    animate={{ scale: 2.5, opacity: 0 }}
                    transition={{ duration: 1.8, repeat: Infinity, ease: [0.4, 0, 0.2, 1] }}
                    className="absolute inset-0 rounded-full bg-[var(--color-accent)]"
                  />
                )}
              </motion.span>
            </button>
          );
        })}
      </div>
    </motion.nav>
  );
}
