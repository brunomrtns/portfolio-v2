import { Link } from 'react-router-dom';
import { Github, Linkedin, Mail } from 'lucide-react';

export function Footer(): React.ReactNode {
  return (
    <footer className="relative border-t border-[var(--color-border)] py-12">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex flex-col items-center justify-between gap-8 md:flex-row">
          {/* Logo */}
          <div className="flex flex-col items-center gap-2 md:items-start">
            <span className="font-mono text-sm font-bold tracking-tight text-[var(--color-text)]">
              bruno<span className="text-[var(--color-accent)]">.</span>integrations
            </span>
            <p className="text-xs text-[var(--color-text-muted)]">
              Engenharia de software com precisão e propósito
            </p>
          </div>

          {/* Links */}
          <div className="flex items-center gap-6">
            <a
              href="https://github.com/brunomrtns"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--color-text-muted)] transition-colors hover:text-[var(--color-accent)]"
              aria-label="GitHub"
            >
              <Github className="h-5 w-5" />
            </a>
            <a
              href="https://linkedin.com/in/bruno-martinss"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--color-text-muted)] transition-colors hover:text-[var(--color-accent)]"
              aria-label="LinkedIn"
            >
              <Linkedin className="h-5 w-5" />
            </a>
            <a
              href="mailto:brunomartinsss@gmail.com"
              className="text-[var(--color-text-muted)] transition-colors hover:text-[var(--color-accent)]"
              aria-label="Email"
            >
              <Mail className="h-5 w-5" />
            </a>
            <Link
              to="/blog"
              className="text-sm text-[var(--color-text-muted)] transition-colors hover:text-[var(--color-accent)]"
            >
              Blog
            </Link>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 border-t border-[var(--color-border)] pt-8 text-center">
          <p className="font-mono text-xs text-[var(--color-text-muted)]">
            © {new Date().getFullYear()} Bruno Martins. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
