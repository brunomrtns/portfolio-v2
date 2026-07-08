import { useTranslation } from 'react-i18next';
import { useSkills } from '@/hooks/use-data';
import { Reveal, Stagger, StaggerItem, MouseSpotlight, SectionTransition } from '@/components/animation/reveal';
import { ScrollHint } from '@/components/scroll-hint';

export function Stack(): React.ReactNode {
  const { t } = useTranslation();
  const { data: skills, isLoading } = useSkills();

  // Group skills by category
  const grouped = (skills ?? []).reduce<Record<string, typeof skills>>((acc, skill) => {
    (acc[skill.category] ??= []).push(skill);
    return acc;
  }, {});

  const categories = Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b));

  return (
    <section id="stack" className="relative py-36">
      <SectionTransition />

      <div className="container-wide">
        {/* Section label */}
        <Reveal>
          <div className="mb-16 flex items-center gap-3">
            <span className="font-mono text-xs text-[var(--color-accent)]">05</span>
            <div className="h-px w-12 bg-[var(--color-border)]" />
            <span className="font-mono text-xs uppercase tracking-[0.15em] text-[var(--color-text-muted)]">
              {t('stack.label')}
            </span>
          </div>
        </Reveal>

        {/* Heading */}
        <div className="grid gap-8 lg:grid-cols-[1fr_1fr] lg:items-end">
          <Reveal>
            <h2 className="font-serif text-4xl font-bold leading-[1.1] tracking-[-0.02em] text-balance text-[var(--color-text)] sm:text-5xl lg:text-6xl">
              {t('stack.title')}
            </h2>
          </Reveal>
          <Reveal delay={0.15}>
            <p className="text-lg leading-[1.7] text-pretty text-[var(--color-text-secondary)]">
              {t('stack.subtitle')}
            </p>
          </Reveal>
        </div>

        {/* Grid — 4 columns on desktop */}
        <div className="mt-16">
          {isLoading ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
                <div
                  key={i}
                  className="h-44 animate-pulse rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)]"
                />
              ))}
            </div>
          ) : (
            <Stagger stagger={0.06} className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {categories.map(([category, items]) => (
                <StaggerItem key={category} y={28}>
                  <MouseSpotlight className="h-full p-6">
                    <h3 className="mb-4 font-mono text-xs uppercase tracking-[0.15em] text-[var(--color-accent)]">
                      {category}
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {items!.map((skill) => (
                        <span
                          key={skill.id}
                          className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-elevated)] px-3 py-1.5 text-sm text-[var(--color-text-secondary)] transition-all duration-300 hover:border-[var(--color-accent)] hover:text-[var(--color-text)] hover:shadow-[0_0_16px_-4px_var(--color-accent-glow)]"
                        >
                          {skill.name}
                        </span>
                      ))}
                    </div>
                  </MouseSpotlight>
                </StaggerItem>
              ))}
            </Stagger>
          )}
        </div>

        <ScrollHint labelKey="scroll.stackToPortfolio" targetId="portfolio" />
      </div>
    </section>
  );
}
