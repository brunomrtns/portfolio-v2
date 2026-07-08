import { Layers, Brain, Server } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Reveal, SectionTransition } from '@/components/animation/reveal';
import { ScrollHint } from '@/components/scroll-hint';

export function Brand(): React.ReactNode {
  const { t } = useTranslation();

  const PILLARS = [
    { icon: Layers, title: t('brand.pillarProductTitle'), desc: t('brand.pillarProductDesc') },
    { icon: Brain, title: t('brand.pillarAiTitle'), desc: t('brand.pillarAiDesc') },
    { icon: Server, title: t('brand.pillarInfraTitle'), desc: t('brand.pillarInfraDesc') },
  ];

  return (
    <section id="marca" className="relative py-24">
      <SectionTransition />

      <div className="container-wide">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.4fr] lg:items-center lg:gap-20">
          {/* Left — brand identity */}
          <Reveal>
            <div>
              <span className="font-mono text-xs uppercase tracking-[0.15em] text-[var(--color-text-muted)]">
                {t('brand.label')}
              </span>
              <h2 className="mt-4 font-serif text-4xl font-bold leading-[1.05] tracking-[-0.03em] text-balance text-[var(--color-text)] sm:text-5xl lg:text-6xl">
                {t('brand.title')}
              </h2>
              <p className="mt-6 max-w-lg text-lg leading-[1.7] text-pretty text-[var(--color-text-secondary)]">
                {t('brand.subtitle')}
              </p>
            </div>
          </Reveal>

          {/* Right — three pillars */}
          <Reveal delay={0.15}>
            <div className="grid gap-4 sm:grid-cols-3 lg:gap-5">
              {PILLARS.map((pillar) => (
                <div
                  key={pillar.title}
                  className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)]/40 p-6 backdrop-blur-md transition-all duration-500 hover:border-[var(--color-border-bright)] hover:bg-[var(--color-surface)]/60"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--color-surface-elevated)] text-[var(--color-accent)] transition-all duration-500 hover:bg-[var(--color-accent)] hover:text-white">
                    <pillar.icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-5 text-base font-semibold tracking-tight text-[var(--color-text)]">
                    {pillar.title}
                  </h3>
                  <p className="mt-2 text-sm leading-[1.65] text-[var(--color-text-secondary)]">
                    {pillar.desc}
                  </p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>

        <ScrollHint labelKey="scroll.brandToAbout" targetId="sobre" />
      </div>
    </section>
  );
}
