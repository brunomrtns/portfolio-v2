import { useExperience } from '@/hooks/use-data';
import { Reveal, Stagger, StaggerItem } from '@/components/animation/reveal';
import { cn } from '@/lib/utils';

export function Experience(): React.ReactNode {
  const { data: experiences, isLoading } = useExperience();

  return (
    <section id="experiencia" className="relative py-32">
      <div className="section-divider absolute top-0 left-0 right-0" />

      <div className="mx-auto max-w-7xl px-6">
        {/* Section label */}
        <Reveal>
          <div className="mb-16 flex items-center gap-3">
            <span className="font-mono text-xs text-[var(--color-accent)]">04</span>
            <div className="h-px w-12 bg-[var(--color-border)]" />
            <span className="font-mono text-xs uppercase tracking-widest text-[var(--color-text-muted)]">
              Experiência
            </span>
          </div>
        </Reveal>

        {/* Heading */}
        <Reveal delay={0.1}>
          <h2 className="font-serif text-4xl font-bold leading-tight text-[var(--color-text)] sm:text-5xl md:text-6xl">
            Trajetória <span className="text-[var(--color-text-muted)]">profissional</span>
          </h2>
        </Reveal>

        {/* Timeline */}
        <div className="mt-16">
          {isLoading ? (
            <div className="space-y-8">
              {[0, 1].map((i) => (
                <div
                  key={i}
                  className="h-40 animate-pulse rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]"
                />
              ))}
            </div>
          ) : (
            <div className="relative">
              {/* Vertical line */}
              <div className="absolute left-4 top-0 bottom-0 w-px bg-gradient-to-b from-[var(--color-border)] via-[var(--color-border)] to-transparent md:left-1/2" />

              <Stagger stagger={0.2} className="space-y-12">
                {experiences?.map((exp, i) => (
                  <StaggerItem key={exp.id}>
                    <div
                      className={cn(
                        'relative pl-12 md:pl-0',
                        i % 2 === 0 ? 'md:pr-[55%] md:text-right' : 'md:pl-[55%]',
                      )}
                    >
                      {/* Dot */}
                      <div
                        className={cn(
                          'absolute left-4 top-2 h-3 w-3 rounded-full border-2 border-[var(--color-bg)] bg-[var(--color-accent)] transition-all duration-300 md:left-1/2 md:-translate-x-1/2',
                          exp.current && 'ring-4 ring-[var(--color-accent-glow)]',
                        )}
                      />

                      {/* Card */}
                      <div className="group rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 transition-all duration-500 hover:border-[var(--color-border-bright)] elevation-1 hover:elevation-3">
                        <div className="flex items-center gap-2">
                          {exp.current && (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--color-accent-glow)] px-2.5 py-0.5 text-xs font-medium text-[var(--color-accent)]">
                              <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-accent)]" />
                              Atual
                            </span>
                          )}
                          <span className="font-mono text-xs text-[var(--color-text-muted)]">
                            {formatDate(exp.startDate)} —{' '}
                            {exp.current ? 'Presente' : exp.endDate ? formatDate(exp.endDate) : '—'}
                          </span>
                        </div>
                        <h3 className="mt-3 text-xl font-bold text-[var(--color-text)]">
                          {exp.role}
                        </h3>
                        <p className="text-sm font-medium text-[var(--color-accent)]">
                          {exp.company}
                          {exp.location && (
                            <span className="text-[var(--color-text-muted)]"> · {exp.location}</span>
                          )}
                        </p>
                        {exp.description && (
                          <p className="mt-3 text-sm leading-relaxed text-[var(--color-text-secondary)]">
                            {exp.description}
                          </p>
                        )}
                        {exp.achievements.length > 0 && (
                          <ul
                            className={cn(
                              'mt-4 space-y-1.5',
                              i % 2 === 0 ? 'md:ml-auto' : '',
                            )}
                          >
                            {exp.achievements.map((achievement, j) => (
                              <li
                                key={j}
                                className="flex items-start gap-2 text-sm text-[var(--color-text-secondary)]"
                              >
                                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-[var(--color-accent)]" />
                                {achievement}
                              </li>
                            ))}
                          </ul>
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
