import { motion } from 'framer-motion';
import { Code2, Brain, Server } from 'lucide-react';
import { Reveal } from '@/components/animation/reveal';

const PILLARS = [
  {
    icon: Code2,
    title: 'Full Stack',
    description: 'React, Node.js, TypeScript e Python — do frontend ao backend com arquitetura escalável.',
  },
  {
    icon: Brain,
    title: 'AI & Automation',
    description: 'Agentes de IA, pipelines com LLMs, MCP e Ollama para acelerar desenvolvimento.',
  },
  {
    icon: Server,
    title: 'Infra & DevOps',
    description: 'Linux, Docker, CI/CD e automação para garantir entrega contínua e confiável.',
  },
];

export function About(): React.ReactNode {
  return (
    <section id="sobre" className="relative py-32">
      <div className="section-divider absolute top-0 left-0 right-0" />

      <div className="mx-auto max-w-7xl px-6">
        {/* Section label */}
        <Reveal>
          <div className="mb-16 flex items-center gap-3">
            <span className="font-mono text-xs text-[var(--color-accent)]">01</span>
            <div className="h-px w-12 bg-[var(--color-border)]" />
            <span className="font-mono text-xs uppercase tracking-widest text-[var(--color-text-muted)]">
              Sobre
            </span>
          </div>
        </Reveal>

        <div className="grid gap-16 lg:grid-cols-2">
          {/* Left — bio */}
          <Reveal delay={0.1}>
            <div>
              <h2 className="font-serif text-3xl font-bold leading-tight text-[var(--color-text)] sm:text-4xl md:text-5xl">
                Resolvo problemas de forma
                <br />
                <span className="text-[var(--color-text-muted)]">prática e eficiente</span>
              </h2>
              <p className="mt-8 text-lg leading-relaxed text-[var(--color-text-secondary)]">
                Atuo no desenvolvimento de aplicações web e sistemas, transitando
                entre frontend, backend, automação e infraestrutura. Tenho aplicado
                IA generativa na construção de agentes e pipelines para automatizar
                processos e acelerar o desenvolvimento de soluções.
              </p>
              <p className="mt-4 text-lg leading-relaxed text-[var(--color-text-secondary)]">
                Priorizo simplicidade, clareza e eficiência em cada solução —
                buscando constantemente evoluir a forma como desenvolvo software.
              </p>
            </div>
          </Reveal>

          {/* Right — pillars */}
          <div className="flex flex-col gap-4">
            {PILLARS.map((pillar, i) => (
              <Reveal key={pillar.title} delay={0.2 + i * 0.1}>
                <div className="group relative overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 transition-all duration-500 hover:border-[var(--color-border-bright)] elevation-2 hover:elevation-3">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-[var(--color-surface-elevated)] text-[var(--color-accent)] transition-colors duration-500 group-hover:bg-[var(--color-accent)] group-hover:text-white">
                      <pillar.icon className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-[var(--color-text)]">
                        {pillar.title}
                      </h3>
                      <p className="mt-2 text-sm leading-relaxed text-[var(--color-text-secondary)]">
                        {pillar.description}
                      </p>
                    </div>
                  </div>
                  {/* Hover glow */}
                  <div className="pointer-events-none absolute -right-20 -top-20 h-40 w-40 rounded-full bg-[var(--color-accent-glow)] opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-100" />
                </div>
              </Reveal>
            ))}
          </div>
        </div>

        {/* Location badge */}
        <Reveal delay={0.5}>
          <div className="mt-16 flex items-center justify-center gap-2 text-sm text-[var(--color-text-muted)]">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-accent)]" />
            <span className="font-mono">Florianópolis, SC — Brasil</span>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
