import { Link } from 'react-router-dom';
import { Github, Linkedin, Mail } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { SectionTransition } from '@/components/animation/reveal';

export function Footer(): React.ReactNode {
  const { t } = useTranslation();
  return (
    <footer className="relative border-t border-[var(--color-border)] py-12">
      {/* Subtle top glow — gradient line */}
      <SectionTransition />

      <div className="container-wide">
        <div className="flex flex-col items-center justify-between gap-8 md:flex-row">
          {/* Logo */}
          <div className="flex flex-col items-center gap-2 md:items-start">
            <span className="font-mono text-sm font-bold tracking-tight text-[var(--color-text)]">
              bruno<span className="text-[var(--color-accent)]">.</span>integrations
            </span>
            <p className="text-xs text-[var(--color-text-muted)]">
              {t('footer.tagline')}
            </p>
          </div>

          {/* Links */}
          <div className="flex items-center gap-6">
            <a
              href="https://github.com/brunomrtns"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--color-text-muted)] transition-all duration-300 hover:text-[var(--color-accent)] hover:scale-110"
              aria-label="GitHub"
            >
              <Github className="h-5 w-5" />
            </a>
            <a
              href="https://linkedin.com/in/bruno-martinss"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--color-text-muted)] transition-all duration-300 hover:text-[var(--color-accent)] hover:scale-110"
              aria-label="LinkedIn"
            >
              <Linkedin className="h-5 w-5" />
            </a>
            <a
              href="mailto:brunomartinsss@gmail.com"
              className="text-[var(--color-text-muted)] transition-all duration-300 hover:text-[var(--color-accent)] hover:scale-110"
              aria-label="Email"
            >
              <Mail className="h-5 w-5" />
            </a>
            <Link
              to="/portfolio/blog"
              className="text-sm text-[var(--color-text-muted)] transition-colors duration-300 hover:text-[var(--color-accent)]"
            >
              {t('nav.blog')}
            </Link>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 border-t border-[var(--color-border)] pt-8 text-center">
          <p className="font-mono text-xs text-[var(--color-text-muted)]">
            {t('footer.copyright', { year: new Date().getFullYear() })}
          </p>
        </div>
      </div>
    </footer>
  );
}
