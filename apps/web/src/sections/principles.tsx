import { Zap, Shield, GitBranch, Gauge, Layers, Heart } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Reveal, Stagger, StaggerItem, SectionTransition } from '@/components/animation/reveal';

export function Principles(): React.ReactNode {
  const { t } = useTranslation();

  const PRINCIPLES = [
    { icon: Zap, title: t('principles.simplicityTitle'), desc: t('principles.simplicityDesc') },
    { icon: Gauge, title: t('principles.performanceTitle'), desc: t('principles.performanceDesc') },
    { icon: Shield, title: t('principles.reliabilityTitle'), desc: t('principles.reliabilityDesc') },
    { icon: GitBranch, title: t('principles.automationTitle'), desc: t('principles.automationDesc') },
    { icon: Layers, title: t('principles.scalabilityTitle'), desc: t('principles.scalabilityDesc') },
    { icon: Heart, title: t('principles.productTitle'), desc: t('principles.productDesc') },
  ];

  return (
    <section id="principios" className="relative py-32">
      <SectionTransition />

      <div className="container-wide">
        {/* Section label */}
        <Reveal>
          <div className="mb-16 flex items-center gap-3">
            <span className="font-mono text-xs text-[var(--color-accent)]">08</span>
            <div className="h-px w-12 bg-[var(--color-border)]" />
            <span className="font-mono text-xs uppercase tracking-[0.15em] text-[var(--color-text-muted)]">
              {t('principles.label')}
            </span>
          </div>
        </Reveal>

        {/* Heading */}
        <Reveal delay={0.1}>
          <h2 className="font-serif text-4xl font-bold leading-[1.1] tracking-[-0.03em] text-balance text-[var(--color-text)] sm:text-5xl lg:text-6xl">
            {t('principles.title')}
          </h2>
        </Reveal>
        <Reveal delay={0.15}>
          <p className="mt-6 max-w-2xl text-lg leading-[1.7] text-pretty text-[var(--color-text-secondary)]">
            {t('principles.subtitle')}
          </p>
        </Reveal>

        {/* Principles grid */}
        <Stagger stagger={0.08} className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {PRINCIPLES.map((principle) => (
            <StaggerItem key={principle.title}>
              <div className="group relative h-full overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)]/30 p-7 backdrop-blur-md transition-all duration-500 hover:border-[var(--color-border-bright)] hover:bg-[var(--color-surface)]/50">
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--color-surface-elevated)] text-[var(--color-accent)] transition-all duration-500 group-hover:bg-[var(--color-accent)] group-hover:text-white">
                    <principle.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold tracking-tight text-[var(--color-text)]">
                      {principle.title}
                    </h3>
                    <p className="mt-2 text-sm leading-[1.65] text-[var(--color-text-secondary)]">
                      {principle.desc}
                    </p>
                  </div>
                </div>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}
