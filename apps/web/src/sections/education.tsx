import { GraduationCap, Award, Code2, GitBranch, Terminal, Brain, FileText, ArrowUpRight, ExternalLink, BadgeCheck } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Reveal, Stagger, StaggerItem, SectionTransition } from '@/components/animation/reveal';
import { ScrollHint } from '@/components/scroll-hint';

// ── Static data (rarely changes, no need for API round-trip) ──────────────────

const DEGREE = {
  course: 'Bacharelado em Sistemas de Informação',
  institution: 'Universidade do Sul de Santa Catarina',
  institutionShort: 'UNISUL',
  period: 'fev 2020 — dez 2023',
  diplomaPdf: '/certificates/diploma-unisul.pdf',
  diplomaImg: '/certificates/diploma-unisul.png',
};

type Certification = {
  title: string;
  institution: string;
  date: string;
  href: string;
  icon: typeof Award;
  external: boolean;
};

const CERTIFICATIONS: Certification[] = [
  {
    title: 'Desenvolvedor Back End — JAVA',
    institution: 'SENAI/SC',
    date: 'mar 2025',
    href: 'https://sgn.sesisenai.org.br/arquivos/certificacao/5a/eb/b3/5aebb3e6df80f2418f13feb6a407c639/1804904_2235945.pdf',
    icon: Code2,
    external: true,
  },
  {
    title: 'IA na Prática: Criação de Prompts',
    institution: 'SENAI',
    date: '2025',
    href: '/certificates/senai-ia-criacao-prompts.pdf',
    icon: Brain,
    external: false,
  },
  {
    title: 'IA na Prática: Fundamentos da Inteligência Artificial',
    institution: 'SENAI',
    date: '2025',
    href: '/certificates/senai-ia-fundamentos.pdf',
    icon: Brain,
    external: false,
  },
  {
    title: 'React — Function Components, uma abordagem moderna',
    institution: 'Alura',
    date: 'mai 2024',
    href: 'https://cursos.alura.com.br/user/bruno-martins28/course/react-function-components/certificate',
    icon: Code2,
    external: true,
  },
  {
    title: 'React — Hooks, Contextos e boas práticas',
    institution: 'Alura',
    date: 'mai 2024',
    href: 'https://cursos.alura.com.br/user/bruno-martins28/course/react-hooks-e-formularios/certificate',
    icon: Code2,
    external: true,
  },
  {
    title: 'Gitlab CI: Pipelines, Continuous Delivery e Deployment',
    institution: 'Udemy',
    date: 'mai 2023',
    href: 'https://udemy-certificate.s3.amazonaws.com/image/UC-4d007a8e-5cc1-468b-af90-a60ef720a8a8.jpg',
    icon: GitBranch,
    external: true,
  },
  {
    title: 'Tudo sobre Linux',
    institution: 'Udemy',
    date: 'out 2022',
    href: 'https://udemy-certificate.s3.amazonaws.com/pdf/UC-170ba908-f0fe-485f-b8ad-7c37cc450406.pdf',
    icon: Terminal,
    external: true,
  },
];

export function Education(): React.ReactNode {
  const { t } = useTranslation();

  return (
    <section id="educacao" className="relative py-36">
      <SectionTransition />
      <div className="mesh-bg pointer-events-none" />

      <div className="container-wide relative">
        {/* Section label */}
        <Reveal>
          <div className="mb-16 flex items-center gap-3">
            <span className="font-mono text-xs text-[var(--color-accent)]">05</span>
            <div className="h-px w-12 bg-[var(--color-border)]" />
            <span className="font-mono text-xs uppercase tracking-[0.15em] text-[var(--color-text-muted)]">
              {t('education.label')}
            </span>
          </div>
        </Reveal>

        {/* Heading */}
        <div className="grid gap-8 lg:grid-cols-[1fr_1fr] lg:items-end">
          <Reveal>
            <h2 className="font-serif text-4xl font-bold leading-[1.1] tracking-[-0.03em] text-balance text-[var(--color-text)] sm:text-5xl lg:text-6xl">
              {t('education.title')}
            </h2>
          </Reveal>
          <Reveal delay={0.15}>
            <p className="text-lg leading-[1.7] text-pretty text-[var(--color-text-secondary)]">
              {t('education.subtitle')}
            </p>
          </Reveal>
        </div>

        {/* ── Degree — featured card with diploma image ─────────────────────── */}
        <Reveal delay={0.2}>
          <div className="card-premium group relative mt-12 elevation-3 gradient-border-active">
            {/* Ambient glow */}
            <div className="pointer-events-none absolute -right-40 -top-40 h-80 w-80 rounded-full bg-[var(--color-accent-glow)] opacity-30 blur-3xl transition-opacity duration-700 group-hover:opacity-60" />

            <div className="relative grid gap-8 p-8 lg:grid-cols-[1fr_1.1fr] lg:gap-12 lg:p-12">
              {/* Left — degree info */}
              <div className="flex flex-col justify-center">
                {/* Badge */}
                <div className="flex flex-wrap items-center gap-3">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--color-accent-glow)] px-3 py-1 text-xs font-medium text-[var(--color-accent)]">
                    <GraduationCap className="h-3 w-3" />
                    {t('education.degreeBadge')}
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-border)] px-3 py-1 font-mono text-xs text-[var(--color-text-muted)]">
                    <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-accent)]" />
                    {t('education.completed')}
                  </span>
                </div>

                {/* Course title */}
                <h3 className="mt-6 font-serif text-3xl font-bold tracking-[-0.03em] text-balance text-[var(--color-text)] sm:text-4xl">
                  {DEGREE.course}
                </h3>

                {/* Institution */}
                <p className="mt-3 text-lg font-medium text-[var(--color-accent)]">
                  {DEGREE.institution}
                </p>
                <p className="mt-1 text-sm text-[var(--color-text-muted)]">
                  {DEGREE.institutionShort}
                </p>

                {/* Period */}
                <p className="mt-4 font-mono text-sm text-[var(--color-text-secondary)]">
                  {DEGREE.period}
                </p>

                {/* Description */}
                <p className="mt-4 max-w-md text-base leading-[1.7] text-pretty text-[var(--color-text-secondary)]">
                  {t('education.degreeDesc')}
                </p>

                {/* CTA — view diploma */}
                <a
                  href={DEGREE.diplomaPdf}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-8 inline-flex items-center gap-2 text-sm font-medium text-[var(--color-text)] transition-colors duration-300 hover:text-[var(--color-accent)]"
                >
                  <FileText className="h-4 w-4" />
                  <span className="link-underline">{t('education.viewDiploma')}</span>
                  <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </a>
              </div>

              {/* Right — diploma image in an elegant frame */}
              <div className="flex items-center justify-center">
                <a
                  href={DEGREE.diplomaPdf}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group/diploma relative block w-full max-w-lg"
                  style={{ perspective: '1000px' }}
                >
                  {/* Frame */}
                  <div className="relative overflow-hidden rounded-xl border border-[var(--color-border-bright)] bg-[var(--color-bg)]/80 p-3 shadow-2xl transition-all duration-500 group-hover/diploma:border-[var(--color-accent)] group-hover/diploma:shadow-[0_0_40px_-8px_var(--color-accent-glow-strong)]">
                    {/* Diploma image */}
                    <img
                      src={DEGREE.diplomaImg}
                      alt={`${DEGREE.course} — ${DEGREE.institution}`}
                      loading="lazy"
                      className="w-full rounded-lg opacity-90 transition-all duration-500 group-hover/diploma:opacity-100 group-hover/diploma:scale-[1.02]"
                    />

                    {/* Overlay sheen on hover */}
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.03] to-transparent opacity-0 transition-opacity duration-500 group-hover/diploma:opacity-100" />
                  </div>

                  {/* Corner badge — "Official" */}
                  <div className="absolute -right-3 -top-3 flex h-16 w-16 rotate-12 items-center justify-center rounded-full border-2 border-[var(--color-accent)] bg-[var(--color-surface-glass)] backdrop-blur-xl transition-all duration-500 group-hover/diploma:rotate-0 group-hover/diploma:scale-110">
                    <BadgeCheck className="h-7 w-7 text-[var(--color-accent)]" />
                  </div>
                </a>
              </div>
            </div>
          </div>
        </Reveal>

        {/* ── Certifications grid ───────────────────────────────────────────── */}
        <div className="mt-16">
          {/* Sub-heading */}
          <Reveal>
            <div className="mb-8 flex items-center gap-3">
              <Award className="h-5 w-5 text-[var(--color-accent)]" />
              <h3 className="font-serif text-2xl font-bold tracking-tight text-[var(--color-text)]">
                {t('education.certificationsTitle')}
              </h3>
            </div>
          </Reveal>

          <Stagger stagger={0.08} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {CERTIFICATIONS.map((cert) => (
              <StaggerItem key={cert.title} y={28}>
                <a
                  href={cert.href}
                  target={cert.external ? '_blank' : '_blank'}
                  rel="noopener noreferrer"
                  className="card-premium group flex h-full flex-col p-6"
                >
                  {/* Top row — icon + external indicator */}
                  <div className="flex items-center justify-between">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--color-surface-elevated)] text-[var(--color-accent)] transition-all duration-500 group-hover:bg-[var(--color-accent)] group-hover:text-white group-hover:shadow-[0_0_20px_-4px_var(--color-accent-glow)]">
                      <cert.icon className="h-5 w-5" />
                    </div>
                    {cert.external ? (
                      <ExternalLink className="h-4 w-4 text-[var(--color-text-muted)] transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[var(--color-accent)]" />
                    ) : (
                      <FileText className="h-4 w-4 text-[var(--color-text-muted)] transition-all duration-300 group-hover:text-[var(--color-accent)]" />
                    )}
                  </div>

                  {/* Title */}
                  <h4 className="mt-5 text-base font-semibold leading-[1.4] tracking-tight text-[var(--color-text)]">
                    {cert.title}
                  </h4>

                  {/* Institution + date */}
                  <div className="mt-auto pt-4">
                    <p className="text-sm font-medium text-[var(--color-accent)]">
                      {cert.institution}
                    </p>
                    <p className="mt-0.5 font-mono text-xs text-[var(--color-text-muted)]">
                      {cert.date}
                    </p>
                  </div>
                </a>
              </StaggerItem>
            ))}
          </Stagger>
        </div>

        <ScrollHint labelKey="scroll.educationToStack" targetId="stack" />
      </div>
    </section>
  );
}
