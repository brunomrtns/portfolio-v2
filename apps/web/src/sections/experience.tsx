import { useExperience } from '@/hooks/use-data';
import { Reveal, Stagger, StaggerItem, SectionTransition } from '@/components/animation/reveal';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';

export function Experience(): React.ReactNode {
  const { t } = useTranslation();
  const { data: experiences, isLoading } = useExperience();

  return (
    <section id="experiencia" className="relative py-36">
      <SectionTransition />
      <div className="mesh-bg pointer-events-none" />

      <div className="container-wide relative">
        {/* Section label */}
        <Reveal>
          <div className="mb-16 flex items-center gap-3">
            <span className="font-mono text-xs text-[var(--color-accent)]">04</span>
            <div className="h-px w-12 bg-[var(--color-border)]" />
            <span className="font-mono text-xs uppercase tracking-[0.15em] text-[var(--color-text-muted)]">
              {t('experience.label')}
            </span>
          </div>
        </Reveal>

        {/* Heading */}
        <div className="grid gap-8 lg:grid-cols-[1fr_1fr] lg:items-end">
          <Reveal>
            <h2 className="font-serif text-4xl font-bold leading-[1.1] tracking-[-0.02em] text-balance text-[var(--color-text)] sm:text-5xl lg:text-6xl">
              {t('experience.title')}
            </h2>
          </Reveal>
          <Reveal delay={0.15}>
            <p className="text-lg leading-[1.7] text-pretty text-[var(--color-text-secondary)]">
              {t('experience.subtitle')}
            </p>
          </Reveal>
        </div>

        {/* Timeline */}
        <div className="mt-16">
          {isLoading ? (
            <div className="space-y-6">
              {[0, 1].map((i) => (
                <div
                  key={i}
                  className="h-48 animate-pulse rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)]"
                />
              ))}
            </div>
          ) : (
            <div className="relative">
              {/* Vertical line */}
              <div className="absolute left-4 top-2 bottom-2 w-px bg-gradient-to-b from-[var(--color-accent)] via-[var(--color-border)] to-transparent md:left-6" />

              <Stagger stagger={0.15} className="space-y-8">
                {experiences?.map((exp) => (
                  <StaggerItem key={exp.id} y={32}>
                    <div className="relative pl-12 md:pl-20">
                      {/* Dot with pulse */}
                      <div className="absolute left-4 top-3 md:left-6">
                        <div className="relative h-3 w-3 rounded-full border-2 border-[var(--color-bg)] bg-[var(--color-accent)]">
                          {exp.current && (
                            <span className="absolute inset-0 animate-ping rounded-full bg-[var(--color-accent)] opacity-60" />
                          )}
                        </div>
                        {exp.current && (
                          <span className="absolute -inset-1.5 rounded-full bg-[var(--color-accent-glow)] blur-sm" />
                        )}
                      </div>

                      {/* Card */}
                      <div className="card-premium group p-6 lg:p-8">
                        {/* Header row */}
                        <div className="flex flex-wrap items-center gap-3">
                          {exp.current && (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--color-accent-glow)] px-2.5 py-0.5 text-xs font-medium text-[var(--color-accent)]">
                              <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-accent)] animate-pulse-glow" />
                              {t('experience.current')}
                            </span>
                          )}
                          <span className="font-mono text-xs text-[var(--color-text-muted)]">
                            {formatDate(exp.startDate)} —{' '}
                            {exp.current ? t('experience.present') : exp.endDate ? formatDate(exp.endDate) : '—'}
                          </span>
                        </div>

                        {/* Title + company */}
                        <div className="mt-4">
                          <h3 className="text-2xl font-bold tracking-tight text-[var(--color-text)]">
                            {exp.role}
                          </h3>
                          <p className="mt-1 text-base font-medium text-[var(--color-accent)]">
                            {exp.company}
                            {exp.location && (
                              <span className="text-[var(--color-text-muted)]"> · {exp.location}</span>
                            )}
                          </p>
                        </div>

                        {/* Description */}
                        {exp.description && (
                          <p className="mt-4 max-w-3xl text-base leading-[1.7] text-[var(--color-text-secondary)]">
                            {exp.description}
                          </p>
                        )}

                        {/* Achievements */}
                        {exp.achievements.length > 0 && (
                          <div className="mt-6 grid gap-3 sm:grid-cols-2">
                            {exp.achievements.map((achievement, j) => (
                              <div
                                key={j}
                                className="flex items-start gap-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)]/50 p-4 transition-colors duration-300 hover:border-[var(--color-accent)]"
                              >
                                <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[var(--color-accent-glow)]">
                                  <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-accent)]" />
                                </span>
                                <span className="text-sm leading-[1.6] text-[var(--color-text-secondary)]">
                                  {achievement}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </StaggerItem>
                ))}
              </Stagger>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function formatDate(iso: string): string {
  const date = new Date(iso);
  return date.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' });
}
