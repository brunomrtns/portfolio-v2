import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowRight, Github, Linkedin, Sparkles, ArrowDown } from 'lucide-react';
import { Magnetic, Counter } from '@/components/animation/reveal';

const EASE_EXPO = [0.16, 1, 0.3, 1] as const;

export function Hero(): React.ReactNode {
  const { t } = useTranslation();
  const containerRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  });

  // Multi-layer parallax for cinematic depth
  const orbsY = useTransform(scrollYProgress, [0, 1], [0, 140]);
  const contentY = useTransform(scrollYProgress, [0, 1], [0, 80]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const contentScale = useTransform(scrollYProgress, [0, 0.5], [1, 0.96]);
  const meshY = useTransform(scrollYProgress, [0, 1], [0, 100]);
  const gridY = useTransform(scrollYProgress, [0, 1], [0, 60]);
  const scrollIndicatorOpacity = useTransform(scrollYProgress, [0, 0.15], [1, 0]);

  const STATS = [
    { value: '2+', label: t('hero.statProducts') },
    { value: '3+', label: t('hero.statExperience') },
    { value: '20+', label: t('hero.statTech') },
    { value: '∞', label: t('hero.statProblems') },
  ];

  return (
    <section
      ref={containerRef}
      className="relative flex min-h-dvh items-center overflow-hidden"
    >
      {/* ── Layer 1: Deep background mesh ─────────────────────────────────────── */}
      <motion.div style={{ y: meshY }} className="mesh-bg-dense" />

      {/* ── Layer 2: Volumetric light beam (breathing) ────────────────────────── */}
      <div className="volumetric-light" />

      {/* ── Layer 3: Grid overlay (parallax, masked) ──────────────────────────── */}
      <motion.div style={{ y: gridY }} className="grid-overlay" />

      {/* ── Layer 4: Aurora gradient (animated, slow) ─────────────────────────── */}
      <div className="aurora-bg" />

      {/* ── Layer 5: Floating aurora orbs (organic movement) ──────────────────── */}
      <motion.div style={{ y: orbsY }} className="pointer-events-none absolute inset-0">
        <motion.div
          className="absolute left-[8%] top-[12%] h-40 w-40 rounded-full bg-[var(--color-accent-glow)] blur-[80px] sm:h-72 sm:w-72 sm:blur-[100px]"
          animate={{
            y: [0, -30, 0],
            x: [0, 20, 0],
            scale: [1, 1.08, 1],
          }}
          transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute right-[8%] bottom-[18%] h-48 w-48 rounded-full bg-[var(--color-accent-warm-glow)] blur-[90px] sm:h-96 sm:w-96 sm:blur-[120px]"
          animate={{
            y: [0, 30, 0],
            x: [0, -20, 0],
            scale: [1, 0.95, 1],
          }}
          transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute left-[45%] top-[60%] h-36 w-36 rounded-full bg-[var(--color-accent-glow)] blur-[85px] sm:h-64 sm:w-64 sm:blur-[110px]"
          animate={{
            y: [0, -20, 0],
            x: [0, 15, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
        />
        {/* Small accent orb — adds detail */}
        <motion.div
          className="absolute right-[30%] top-[25%] h-20 w-20 rounded-full bg-[var(--color-accent-glow)] blur-[60px] sm:h-32 sm:w-32 sm:blur-[80px]"
          animate={{
            y: [0, 15, 0],
            x: [0, -10, 0],
            scale: [1, 1.15, 1],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        />
      </motion.div>

      {/* ── Layer 6: Noise texture ────────────────────────────────────────────── */}
      <div className="noise" />

      {/* ── Content ───────────────────────────────────────────────────────────── */}
      <motion.div
        style={{ y: contentY, opacity: contentOpacity, scale: contentScale }}
        className="container-wide relative z-10 pt-12 pb-28 sm:py-20"
      >
        <div className="grid items-center gap-10 sm:gap-16 lg:grid-cols-[1.2fr_0.8fr]">
          {/* Left — headline + CTAs */}
          <div>
            {/* Badge — availability indicator */}
            <motion.div
              initial={{ opacity: 0, y: 20, filter: 'blur(8px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              transition={{ duration: 0.7, ease: EASE_EXPO }}
              className="mb-8 inline-flex items-center gap-2.5 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)]/60 px-4 py-2 backdrop-blur-md"
            >
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--color-accent)] opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-[var(--color-accent)]" />
              </span>
              <span className="font-mono text-xs text-[var(--color-text-secondary)]">
                {t('hero.badge')}
              </span>
            </motion.div>

            {/* Headline — word-by-word cinematic reveal */}
            <h1 className="font-serif text-4xl font-bold leading-[1.05] tracking-[-0.03em] text-[var(--color-text)] sm:text-6xl lg:text-7xl xl:text-[5.5rem]">
              <motion.span
                className="block"
                initial={{ opacity: 0, y: 30, filter: 'blur(12px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                transition={{ duration: 0.9, delay: 0.1, ease: EASE_EXPO }}
              >
                {t('hero.titleLine1')}
              </motion.span>
              <motion.span
                className="gradient-text-accent block"
                initial={{ opacity: 0, y: 30, filter: 'blur(12px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                transition={{ duration: 0.9, delay: 0.3, ease: EASE_EXPO }}
              >
                {t('hero.titleLine2')}
              </motion.span>
            </h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20, filter: 'blur(8px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              transition={{ duration: 0.8, delay: 0.5, ease: EASE_EXPO }}
              className="mt-8 max-w-xl text-lg leading-[1.7] text-[var(--color-text-secondary)] text-pretty sm:text-xl"
            >
              {t('hero.subtitle')}
            </motion.p>

            {/* CTAs — with magnetic effect */}
            <motion.div
              initial={{ opacity: 0, y: 20, filter: 'blur(8px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              transition={{ duration: 0.8, delay: 0.65, ease: EASE_EXPO }}
              className="mt-10 flex flex-wrap items-center gap-4"
            >
              <Magnetic strength={0.25}>
                <a
                  href="#produtos"
                  className="group relative inline-flex h-12 items-center gap-2 overflow-hidden rounded-xl bg-[var(--color-accent)] px-8 font-semibold text-white shadow-[0_0_24px_-4px_var(--color-accent-glow)] transition-all duration-500 hover:shadow-[0_0_40px_-4px_var(--color-accent-glow)] hover:bg-[var(--color-accent-hover)] active:scale-[0.97]"
                >
                  {/* Shimmer sweep on hover */}
                  <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/15 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                  <span className="relative">{t('hero.ctaProducts')}</span>
                  <ArrowRight className="relative h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </a>
              </Magnetic>

              <Magnetic strength={0.15}>
                <a
                  href="https://github.com/brunomrtns"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-12 items-center gap-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]/40 px-6 font-medium text-[var(--color-text-secondary)] backdrop-blur-md transition-all duration-400 hover:border-[var(--color-border-bright)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface)]/60"
                >
                  <Github className="h-5 w-5" />
                  {t('hero.ctaGithub')}
                </a>
              </Magnetic>

              <Magnetic strength={0.15}>
                <a
                  href="https://linkedin.com/in/bruno-martinss"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-12 items-center gap-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]/40 px-6 font-medium text-[var(--color-text-secondary)] backdrop-blur-md transition-all duration-400 hover:border-[var(--color-border-bright)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface)]/60"
                >
                  <Linkedin className="h-5 w-5" />
                  {t('hero.ctaLinkedin')}
                </a>
              </Magnetic>
            </motion.div>
          </div>

          {/* Right — stats card with animated gradient border and counters */}
          <motion.div
            initial={{ opacity: 0, x: 40, filter: 'blur(12px)' }}
            animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
            transition={{ duration: 0.9, delay: 0.7, ease: EASE_EXPO }}
            className="hidden lg:block"
          >
            <div className="gradient-border-active relative overflow-hidden rounded-2xl bg-[var(--color-surface)]/60 p-8 elevation-3 backdrop-blur-xl">
              {/* Inner glows — teal + amber for depth */}
              <div className="pointer-events-none absolute -right-20 -top-20 h-48 w-48 rounded-full bg-[var(--color-accent-glow)] opacity-40 blur-3xl" />
              <div className="pointer-events-none absolute -bottom-20 -left-20 h-40 w-40 rounded-full bg-[var(--color-accent-warm-glow)] opacity-30 blur-3xl" />

              <div className="relative">
                {/* Header */}
                <div className="mb-8 flex items-center gap-2.5">
                  <Sparkles className="h-4 w-4 text-[var(--color-accent)]" />
                  <span className="font-mono text-xs uppercase tracking-[0.15em] text-[var(--color-text-muted)]">
                    {t('hero.statsHeader')}
                  </span>
                </div>

                {/* Stats grid — with animated counters */}
                <div className="grid grid-cols-2 gap-x-6 gap-y-8">
                  {STATS.map((stat, i) => (
                    <motion.div
                      key={stat.label}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 0.9 + i * 0.1, ease: EASE_EXPO }}
                    >
                      <p className="font-serif text-4xl font-bold tracking-tight text-[var(--color-text)]">
                        {stat.value === '∞' ? (
                          <motion.span
                            initial={{ opacity: 0, scale: 0.5 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.8, delay: 1.3, ease: EASE_EXPO }}
                          >
                            ∞
                          </motion.span>
                        ) : (
                          <Counter value={stat.value} delay={0.9 + i * 0.1} />
                        )}
                      </p>
                      <p className="mt-1.5 text-sm text-[var(--color-text-muted)]">
                        {stat.label}
                      </p>
                    </motion.div>
                  ))}
                </div>

                {/* Footer — location with pulse */}
                <div className="mt-8 flex items-center gap-2 border-t border-[var(--color-border)] pt-6">
                  <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-accent)] animate-pulse-glow" />
                  <p className="font-mono text-xs text-[var(--color-text-muted)]">
                    {t('hero.location')}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Mobile stats — compact 2x2 grid, shown only on < lg */}
          <motion.div
            initial={{ opacity: 0, y: 20, filter: 'blur(8px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ duration: 0.8, delay: 0.7, ease: EASE_EXPO }}
            className="mt-10 lg:hidden"
          >
            <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)]/60 p-5 backdrop-blur-md">
              <div className="mb-4 flex items-center gap-2">
                <Sparkles className="h-3.5 w-3.5 text-[var(--color-accent)]" />
                <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-[var(--color-text-muted)]">
                  {t('hero.statsHeader')}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-x-4 gap-y-5">
                {STATS.map((stat, i) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.9 + i * 0.1, ease: EASE_EXPO }}
                  >
                    <p className="font-serif text-2xl font-bold tracking-tight text-[var(--color-text)]">
                      {stat.value === '∞' ? (
                        <motion.span
                          initial={{ opacity: 0, scale: 0.5 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.6, delay: 1.3, ease: EASE_EXPO }}
                        >
                          ∞
                        </motion.span>
                      ) : (
                        <Counter value={stat.value} delay={0.9 + i * 0.1} />
                      )}
                    </p>
                    <p className="mt-0.5 text-xs text-[var(--color-text-muted)]">
                      {stat.label}
                    </p>
                  </motion.div>
                ))}
              </div>
              <div className="mt-4 flex items-center gap-2 border-t border-[var(--color-border)] pt-3">
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-accent)] animate-pulse-glow" />
                <p className="font-mono text-[10px] text-[var(--color-text-muted)]">
                  {t('hero.location')}
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* ── Scroll indicator — fades on scroll ─────────────────────────────────── */}
      <motion.div
        style={{ opacity: scrollIndicatorOpacity }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.6 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
          className="flex h-10 w-6 items-start justify-center rounded-full border border-[var(--color-border)] p-2"
        >
          <ArrowDown className="h-3 w-3 text-[var(--color-text-muted)]" />
        </motion.div>
      </motion.div>
    </section>
  );
}
