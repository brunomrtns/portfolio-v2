import { useSkills } from '@/hooks/use-data';
import { Reveal, Stagger, StaggerItem } from '@/components/animation/reveal';

export function Stack(): React.ReactNode {
  const { data: skills, isLoading } = useSkills();

  // Group skills by category
  const grouped = (skills ?? []).reduce<Record<string, typeof skills>>((acc, skill) => {
    (acc[skill.category] ??= []).push(skill);
    return acc;
  }, {});

  const categories = Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b));

  return (
    <section id="stack" className="relative py-32">
      <div className="section-divider absolute top-0 left-0 right-0" />

      <div className="mx-auto max-w-7xl px-6">
        {/* Section label */}
        <Reveal>
          <div className="mb-16 flex items-center gap-3">
            <span className="font-mono text-xs text-[var(--color-accent)]">03</span>
            <div className="h-px w-12 bg-[var(--color-border)]" />
            <span className="font-mono text-xs uppercase tracking-widest text-[var(--color-text-muted)]">
              Stack
            </span>
          </div>
        </Reveal>

        {/* Heading */}
        <Reveal delay={0.1}>
          <h2 className="font-serif text-4xl font-bold leading-tight text-[var(--color-text)] sm:text-5xl md:text-6xl">
            Tecnologias & <span className="text-[var(--color-text-muted)]">ferramentas</span>
          </h2>
        </Reveal>

        {/* Grid */}
        <div className="mt-16">
          {isLoading ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="h-40 animate-pulse rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]"
                />
              ))}
            </div>
          ) : (
            <Stagger stagger={0.1} className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {categories.map(([category, items]) => (
                <StaggerItem key={category}>
                  <div className="group rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 transition-all duration-500 hover:border-[var(--color-border-bright)] elevation-1 hover:elevation-3">
                    <h3 className="mb-4 font-mono text-xs uppercase tracking-widest text-[var(--color-accent)]">
                      {category}
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {items!.map((skill) => (
                        <span
                          key={skill.id}
                          className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-elevated)] px-3 py-1.5 text-sm text-[var(--color-text-secondary)] transition-all duration-300 hover:border-[var(--color-accent)] hover:text-[var(--color-text)]"
                        >
                          {skill.name}
                        </span>
                      ))}
                    </div>
                  </div>
                </StaggerItem>
              ))}
            </Stagger>
          )}
        </div>
      </div>
    </section>
  );
}
