import { Code2, Brain, Server, Layers, Zap, Shield } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Reveal, Stagger, StaggerItem, MouseSpotlight, SectionTransition } from '@/components/animation/reveal';
import { ScrollHint } from '@/components/scroll-hint';

export function About(): React.ReactNode {
  const { t } = useTranslation();

  const PILLARS = [
    { icon: Code2, title: t('about.pillarFullStackTitle'), description: t('about.pillarFullStackDesc') },
    { icon: Brain, title: t('about.pillarAiTitle'), description: t('about.pillarAiDesc') },
    { icon: Server, title: t('about.pillarInfraTitle'), description: t('about.pillarInfraDesc') },
    { icon: Layers, title: t('about.pillarArchTitle'), description: t('about.pillarArchDesc') },
    { icon: Zap, title: t('about.pillarPerfTitle'), description: t('about.pillarPerfDesc') },
    { icon: Shield, title: t('about.pillarReliabilityTitle'), description: t('about.pillarReliabilityDesc') },
  ];

  return (
    <section id="sobre" className="relative py-32">
      <SectionTransition />
      <div className="mesh-bg pointer-events-none" />

      <div className="container-wide relative">
        <Reveal>
          <div className="mb-16 flex items-center gap-3">
            <span className="font-mono text-xs text-[var(--color-accent)]">01</span>
            <div className="h-px w-12 bg-[var(--color-border)]" />
            <span className="font-mono text-xs uppercase tracking-[0.15em] text-[var(--color-text-muted)]">
              {t('about.label')}
            </span>
          </div>
        </Reveal>

        <div className="grid gap-12 lg:grid-cols-[1fr_1.5fr] lg:gap-20">
          <Reveal>
            <h2 className="font-serif text-4xl font-bold leading-[1.1] tracking-[-0.02em] text-balance text-[var(--color-text)] sm:text-5xl lg:text-6xl">
              {t('about.titleLine1')}
              <br />
              <span className="text-[var(--color-text-muted)]">{t('about.titleLine2')}</span>
            </h2>
          </Reveal>

          <Reveal delay={0.15}>
            <div className="space-y-5 text-lg leading-[1.75] text-[var(--color-text-secondary)]">
              <p className="text-pretty">{t('about.bio1')}</p>
              <p className="text-pretty">
                {t('about.bio2', {
                  highlight1: t('about.bioHighlight1'),
                  highlight2: t('about.bioHighlight2'),
                  highlight3: t('about.bioHighlight3'),
                })}
              </p>
            </div>
          </Reveal>
        </div>

        <Stagger stagger={0.08} className="mt-20 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {PILLARS.map((pillar) => (
            <StaggerItem key={pillar.title}>
              <MouseSpotlight className="h-full p-7">
                <div className="pointer-events-none absolute -right-16 -top-16 h-32 w-32 rounded-full bg-[var(--color-accent-glow)] opacity-0 blur-3xl transition-opacity duration-500 hover:opacity-100" />
                <div className="relative flex items-start gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--color-surface-elevated)] text-[var(--color-accent)] transition-all duration-500 hover:bg-[var(--color-accent)] hover:text-white hover:shadow-[0_0_20px_-4px_var(--color-accent-glow)]">
                    <pillar.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold tracking-tight text-[var(--color-text)]">
                      {pillar.title}
                    </h3>
                    <p className="mt-2 text-sm leading-[1.65] text-[var(--color-text-secondary)]">
                      {pillar.description}
                    </p>
                  </div>
                </div>
              </MouseSpotlight>
            </StaggerItem>
          ))}
        </Stagger>

        <ScrollHint labelKey="scroll.aboutToSolutions" targetId="solucoes" />
      </div>
    </section>
  );
}
