import { ArrowUpRight, Github, Server, Globe, Layers, Database } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Reveal, Stagger, StaggerItem, SectionTransition } from '@/components/animation/reveal';

const REPO_URL = 'https://github.com/brunomrtns/portfolio-v2';

const TECH_STACK = [
  'React 19',
  'Vite 6',
  'TypeScript 5',
  'Tailwind CSS v4',
  'Framer Motion',
  'GSAP',
  'TanStack Query 5',
  'i18next',
  'Fastify 5',
  'Prisma 6',
  'PostgreSQL 16',
  'Docker',
  'Nginx',
  'Turborepo',
  'pnpm',
  'Lenis',
];

const FEATURES = [
  { icon: Globe, key: 'i18n' },
  { icon: Layers, key: 'monorepo' },
  { icon: Server, key: 'deploy' },
  { icon: Database, key: 'translations' },
];

export function PortfolioAbout(): React.ReactNode {
  const { t } = useTranslation();

  return (
    <section id="portfolio" className="relative py-32">
      <SectionTransition />
      <div className="mesh-bg pointer-events-none" />

      <div className="container-wide relative">
        {/* Section label */}
        <Reveal>
          <div className="mb-16 flex items-center gap-3">
            <span className="font-mono text-xs text-[var(--color-accent)]">06</span>
            <div className="h-px w-12 bg-[var(--color-border)]" />
            <span className="font-mono text-xs uppercase tracking-[0.15em] text-[var(--color-text-muted)]">
              {t('portfolioAbout.label')}
            </span>
          </div>
        </Reveal>

        {/* Heading + description */}
        <div className="grid gap-8 lg:grid-cols-[1fr_1fr] lg:items-end">
          <Reveal>
            <h2 className="font-serif text-4xl font-bold leading-[1.1] tracking-[-0.03em] text-[var(--color-text)] sm:text-5xl lg:text-6xl text-balance">
              {t('portfolioAbout.title')}
            </h2>
          </Reveal>
          <Reveal delay={0.15}>
            <p className="text-lg leading-[1.7] text-[var(--color-text-secondary)] text-pretty">
              {t('portfolioAbout.subtitle')}
            </p>
          </Reveal>
        </div>

        {/* Main card — project info + repo link */}
        <Reveal delay={0.2}>
          <div className="card-premium group relative mt-12 elevation-2">
            <div className="pointer-events-none absolute -right-40 -top-40 h-80 w-80 rounded-full bg-[var(--color-accent-glow)] opacity-20 blur-3xl transition-opacity duration-700 group-hover:opacity-40" />

            <div className="relative grid gap-8 p-8 lg:grid-cols-[1.3fr_1fr] lg:gap-12 lg:p-12">
              {/* Left — description */}
              <div>
                <h3 className="font-serif text-3xl font-bold tracking-[-0.03em] text-[var(--color-text)] sm:text-4xl text-balance">
                  {t('portfolioAbout.projectName')}
                </h3>
                <p className="mt-3 text-lg font-medium text-[var(--color-accent)]">
                  {t('portfolioAbout.projectTagline')}
                </p>
                <p className="mt-4 max-w-xl text-base leading-[1.7] text-[var(--color-text-secondary)] text-pretty">
                  {t('portfolioAbout.projectDescription')}
                </p>

                {/* Tech badges */}
                <div className="mt-6 flex flex-wrap gap-2">
                  {TECH_STACK.map((tech) => (
                    <span key={tech} className="tech-badge">
                      {tech}
                    </span>
                  ))}
                </div>

                {/* Repo CTA */}
                <a
                  href={REPO_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-8 inline-flex items-center gap-2 text-sm font-medium text-[var(--color-text)] transition-colors duration-300 hover:text-[var(--color-accent)]"
                >
                  <Github className="h-4 w-4" />
                  <span className="link-underline">{t('portfolioAbout.viewSource')}</span>
                  <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </a>
              </div>

              {/* Right — features grid */}
              <div className="flex flex-col justify-center">
                <Stagger stagger={0.1} className="grid gap-4 sm:grid-cols-2">
                  {FEATURES.map((feature) => (
                    <StaggerItem key={feature.key}>
                      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)]/60 p-5 backdrop-blur-sm transition-all duration-300 hover:border-[var(--color-border-bright)]">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--color-surface-elevated)] text-[var(--color-accent)] transition-all duration-500 hover:bg-[var(--color-accent)] hover:text-white">
                          <feature.icon className="h-5 w-5" />
                        </div>
                        <h4 className="mt-4 text-sm font-semibold tracking-tight text-[var(--color-text)]">
                          {t(`portfolioAbout.feature${feature.key.charAt(0).toUpperCase() + feature.key.slice(1)}Title`)}
                        </h4>
                        <p className="mt-1.5 text-xs leading-[1.6] text-[var(--color-text-secondary)]">
                          {t(`portfolioAbout.feature${feature.key.charAt(0).toUpperCase() + feature.key.slice(1)}Desc`)}
                        </p>
                      </div>
                    </StaggerItem>
                  ))}
                </Stagger>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
