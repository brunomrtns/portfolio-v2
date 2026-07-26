import { Brain, AppWindow, Server } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Reveal, Stagger, StaggerItem, SectionTransition } from '@/components/animation/reveal';
import { ScrollHint } from '@/components/scroll-hint';

export function Solutions(): React.ReactNode {
  const { t } = useTranslation();

  const AREAS = [
    {
      icon: Brain,
      title: t('solutions.aiTitle'),
      desc: t('solutions.aiDesc'),
      tags: ['LLM', 'RAG', 'MCP', 'Agentes', 'Ollama'],
    },
    {
      icon: AppWindow,
      title: t('solutions.productTitle'),
      desc: t('solutions.productDesc'),
      tags: ['React', 'Node.js', 'TypeScript', 'Design System'],
    },
    {
      icon: Server,
      title: t('solutions.infraTitle'),
      desc: t('solutions.infraDesc'),
      tags: ['Docker', 'Nginx', 'CI/CD', 'Linux', 'PostgreSQL'],
    },
  ];

  return (
    <section id="solucoes" className="relative py-20 sm:py-32">
      <SectionTransition />
      <div className="mesh-bg pointer-events-none" />

      <div className="container-wide relative">
        {/* Section label */}
        <Reveal>
          <div className="mb-8 sm:mb-16 flex items-center gap-3">
            <span className="font-mono text-xs text-[var(--color-accent)]">03</span>
            <div className="h-px w-12 bg-[var(--color-border)]" />
            <span className="font-mono text-xs uppercase tracking-[0.15em] text-[var(--color-text-muted)]">
              {t('solutions.label')}
            </span>
          </div>
        </Reveal>

        {/* Heading */}
        <div className="grid gap-8 lg:grid-cols-[1fr_1fr] lg:items-end">
          <Reveal>
            <h2 className="font-serif text-4xl font-bold leading-[1.1] tracking-[-0.03em] text-balance text-[var(--color-text)] sm:text-5xl lg:text-6xl">
              {t('solutions.title')}
            </h2>
          </Reveal>
          <Reveal delay={0.15}>
            <p className="text-lg leading-[1.7] text-pretty text-[var(--color-text-secondary)]">
              {t('solutions.subtitle')}
            </p>
          </Reveal>
        </div>

        {/* Three areas */}
        <Stagger stagger={0.12} className="mt-10 sm:mt-16 grid gap-6 lg:grid-cols-3">
          {AREAS.map((area) => (
            <StaggerItem key={area.title} y={32}>
              <div className="card-premium group h-full p-8 elevation-2">
                <div className="pointer-events-none absolute -right-16 -top-16 h-24 w-24 rounded-full bg-[var(--color-accent-glow)] opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-100 sm:h-32 sm:w-32" />

                <div className="relative">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--color-surface-elevated)] text-[var(--color-accent)] transition-all duration-500 group-hover:bg-[var(--color-accent)] group-hover:text-white group-hover:shadow-[0_0_20px_-4px_var(--color-accent-glow)]">
                    <area.icon className="h-6 w-6" />
                  </div>

                  <h3 className="mt-6 font-serif text-2xl font-bold tracking-tight text-[var(--color-text)]">
                    {area.title}
                  </h3>
                  <p className="mt-3 text-base leading-[1.7] text-pretty text-[var(--color-text-secondary)]">
                    {area.desc}
                  </p>

                  <div className="mt-6 flex flex-wrap gap-2">
                    {area.tags.map((tag) => (
                      <span key={tag} className="tech-badge">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </StaggerItem>
          ))}
        </Stagger>

        <ScrollHint labelKey="scroll.solutionsToProducts" targetId="produtos" />
      </div>
    </section>
  );
}
