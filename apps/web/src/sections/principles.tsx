import { Zap, Shield, GitBranch, Gauge, Layers, Heart } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Reveal, Stagger, StaggerItem, SectionTransition } from '@/components/animation/reveal';
import { ScrollHint } from '@/components/scroll-hint';

export function Principles(): React.ReactNode {
  const { t } = useTranslation();

  const PRINCIPLES = [
    { icon: Zap, metric: 'KISS', title: t('principles.simplicityTitle'), desc: t('principles.simplicityDesc') },
    { icon: Gauge, metric: '< 100ms', title: t('principles.performanceTitle'), desc: t('principles.performanceDesc') },
    { icon: Shield, metric: '0 surpresas', title: t('principles.reliabilityTitle'), desc: t('principles.reliabilityDesc') },
    { icon: GitBranch, metric: '1 comando', title: t('principles.automationTitle'), desc: t('principles.automationDesc') },
    { icon: Layers, metric: 'Monorepo', title: t('principles.scalabilityTitle'), desc: t('principles.scalabilityDesc') },
    { icon: Heart, metric: 'User-first', title: t('principles.productTitle'), desc: t('principles.productDesc') },
  ];

  return (
    <section id="principios" className="relative py-20 sm:py-32">
      <SectionTransition />
      <div className="mesh-bg pointer-events-none" />

      <div className="container-wide relative">
        {/* Section label */}
        <Reveal>
          <div className="mb-8 sm:mb-16 flex items-center gap-3">
            <span className="font-mono text-xs text-[var(--color-accent)]">08</span>
            <div className="h-px w-12 bg-[var(--color-border)]" />
            <span className="font-mono text-xs uppercase tracking-[0.15em] text-[var(--color-text-muted)]">
              {t('principles.label')}
            </span>
          </div>
        </Reveal>

        {/* Heading + manifesto */}
        <div className="grid gap-8 lg:grid-cols-[1fr_1fr] lg:items-end">
          <Reveal>
            <h2 className="font-serif text-4xl font-bold leading-[1.1] tracking-[-0.03em] text-balance text-[var(--color-text)] sm:text-5xl lg:text-6xl">
              {t('principles.title')}
            </h2>
          </Reveal>
          <Reveal delay={0.15}>
            <div className="space-y-4">
              <p className="text-lg leading-[1.7] text-pretty text-[var(--color-text-secondary)]">
                {t('principles.subtitle')}
              </p>
              <p className="text-base leading-[1.7] text-pretty text-[var(--color-text-muted)]">
                {t('principles.manifesto')}
              </p>
            </div>
          </Reveal>
        </div>

        {/* Principles grid — richer cards with metric */}
        <Stagger stagger={0.08} className="mt-10 sm:mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {PRINCIPLES.map((principle) => (
            <StaggerItem key={principle.title}>
              <div className="group relative h-full overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)]/30 p-7 backdrop-blur-md transition-all duration-500 hover:border-[var(--color-border-bright)] hover:bg-[var(--color-surface)]/50">
                <div className="pointer-events-none absolute -right-16 -top-16 h-24 w-24 rounded-full bg-[var(--color-accent-glow)] opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-100 sm:h-32 sm:w-32" />

                <div className="relative">
                  <div className="flex items-center justify-between">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--color-surface-elevated)] text-[var(--color-accent)] transition-all duration-500 group-hover:bg-[var(--color-accent)] group-hover:text-white group-hover:shadow-[0_0_20px_-4px_var(--color-accent-glow)]">
                      <principle.icon className="h-5 w-5" />
                    </div>
                    <span className="font-mono text-xs uppercase tracking-[0.12em] text-[var(--color-text-muted)] transition-colors duration-500 group-hover:text-[var(--color-accent)]">
                      {principle.metric}
                    </span>
                  </div>
                  <h3 className="mt-5 font-serif text-xl font-bold tracking-tight text-[var(--color-text)]">
                    {principle.title}
                  </h3>
                  <p className="mt-2 text-sm leading-[1.65] text-[var(--color-text-secondary)]">
                    {principle.desc}
                  </p>
                </div>
              </div>
            </StaggerItem>
          ))}
        </Stagger>

        {/* Closing statement */}
        <Reveal delay={0.2}>
          <div className="mt-10 sm:mt-16 flex flex-col items-center text-center">
            <div className="h-px w-16 bg-gradient-to-r from-transparent via-[var(--color-accent)] to-transparent" />
            <p className="mt-6 max-w-2xl font-serif text-xl italic leading-[1.6] text-pretty text-[var(--color-text-secondary)] sm:text-2xl">
              {t('principles.closing')}
            </p>
          </div>
        </Reveal>

        <ScrollHint labelKey="scroll.principlesToContact" targetId="contato" />
      </div>
    </section>
  );
}
