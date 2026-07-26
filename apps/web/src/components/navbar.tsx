import { useEffect, useState, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Globe, Github } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { ScrollProgress } from '@/components/animation/reveal';
import { changeLanguage, getCurrentLanguage, AVAILABLE_LANGUAGES } from '@/i18n/i18n';

// Only the most important links belong in the navbar.
// Section-to-section navigation is handled by the dot rail (SectionDots).
const NAV_LINKS = [
  { labelKey: 'nav.produtos', href: '#produtos' },
  { labelKey: 'nav.blog', href: '/portfolio/blog' },
  { labelKey: 'nav.contato', href: '#contato' },
];

export function Navbar(): React.ReactNode {
  const { t } = useTranslation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const location = useLocation();
  const langRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    handler();
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  useEffect(() => {
    if (!langOpen) return;
    const handler = (e: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(e.target as Node)) {
        setLangOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [langOpen]);

  useEffect(() => {
    setMobileOpen(false);
    setLangOpen(false);
  }, [location]);

  const isHome = location.pathname === '/' || location.pathname === '/portfolio' || location.pathname === '/portfolio/';

  return (
    <>
      <ScrollProgress />

      <motion.header
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className={cn(
          'fixed top-0 left-0 right-0 z-50 transition-all duration-500',
          scrolled
            ? 'glass-strong'
            : 'bg-transparent border-transparent',
        )}
      >
        <nav className="container-wide flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="group flex items-center gap-2" onClick={() => isHome && window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <span className="font-mono text-sm font-bold tracking-tight text-[var(--color-text)] transition-all duration-300 group-hover:opacity-90">
              bruno<span className="text-[var(--color-accent)] transition-all duration-300 group-hover:[text-shadow:0_0_8px_var(--color-accent-glow)]">.</span>integrations
            </span>
          </Link>

          {/* Desktop nav — minimal */}
          {isHome && (
            <div className="hidden items-center gap-1 md:flex">
              {NAV_LINKS.map((link) =>
                link.href.startsWith('#') ? (
                  <a
                    key={link.href}
                    href={link.href}
                    className="nav-link px-4 py-2 text-sm text-[var(--color-text-secondary)]"
                  >
                    {t(link.labelKey)}
                  </a>
                ) : (
                  <Link
                    key={link.href}
                    to={link.href}
                    className="nav-link px-4 py-2 text-sm text-[var(--color-text-secondary)]"
                  >
                    {t(link.labelKey)}
                  </Link>
                ),
              )}
            </div>
          )}

          {/* Right cluster: language + GitHub + mobile toggle */}
          <div className="flex items-center gap-3">
            <div ref={langRef} className="relative hidden sm:block">
              <button
                onClick={() => setLangOpen((v) => !v)}
                className="flex items-center gap-1.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]/40 px-3 py-2 text-sm text-[var(--color-text-secondary)] backdrop-blur-md transition-all duration-300 hover:border-[var(--color-border-bright)] hover:text-[var(--color-text)]"
                aria-label={t('language.switch')}
              >
                <Globe className="h-4 w-4" />
                <span className="font-mono text-xs">
                  {AVAILABLE_LANGUAGES.find((l) => l.code === getCurrentLanguage())?.code ?? 'pt-BR'}
                </span>
              </button>
              <AnimatePresence>
                {langOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.96 }}
                    transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                    className="absolute right-0 top-full mt-2 w-48 overflow-hidden rounded-xl border border-[var(--color-border)] glass-strong p-1.5 z-50 elevation-3"
                  >
                    {AVAILABLE_LANGUAGES.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => {
                          changeLanguage(lang.code);
                          setLangOpen(false);
                        }}
                        className={cn(
                          'flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm transition-colors',
                          getCurrentLanguage() === lang.code
                            ? 'bg-[var(--color-surface-elevated)] text-[var(--color-text)]'
                            : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-elevated)] hover:text-[var(--color-text)]',
                        )}
                      >
                        <span className="text-base">{lang.flag}</span>
                        <span className="flex-1">{lang.label}</span>
                        {getCurrentLanguage() === lang.code && (
                          <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-accent)]" />
                        )}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <a
              href="https://github.com/brunomrtns"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]/40 px-4 py-2 text-sm text-[var(--color-text-secondary)] backdrop-blur-md transition-all duration-300 hover:border-[var(--color-border-bright)] hover:text-[var(--color-text)] md:block"
            >
              {t('nav.github')}
            </a>
            <button
              className="rounded-lg p-2.5 text-[var(--color-text-secondary)] transition-colors hover:text-[var(--color-text)] md:hidden"
              onClick={() => setMobileOpen((v) => !v)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </nav>
      </motion.header>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="fixed top-16 left-0 right-0 z-40 glass-strong md:hidden"
          >
            <div className="flex flex-col gap-1 px-6 py-4">
              {NAV_LINKS.map((link) =>
                link.href.startsWith('#') ? (
                  <a
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className="rounded-xl px-4 py-3 text-sm text-[var(--color-text-secondary)] transition-colors hover:bg-[var(--color-surface-elevated)] hover:text-[var(--color-text)]"
                  >
                    {t(link.labelKey)}
                  </a>
                ) : (
                  <Link
                    key={link.href}
                    to={link.href}
                    onClick={() => setMobileOpen(false)}
                    className="rounded-xl px-4 py-3 text-sm text-[var(--color-text-secondary)] transition-colors hover:bg-[var(--color-surface-elevated)] hover:text-[var(--color-text)]"
                  >
                    {t(link.labelKey)}
                  </Link>
                ),
              )}

              {/* Divider */}
              <div className="my-2 h-px bg-[var(--color-border)]" />

              {/* GitHub — only in mobile menu (hidden in navbar on mobile) */}
              <a
                href="https://github.com/brunomrtns"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-[var(--color-text-secondary)] transition-colors hover:bg-[var(--color-surface-elevated)] hover:text-[var(--color-text)]"
              >
                <Github className="h-4 w-4" />
                {t('nav.github')}
              </a>

              {/* Language selector — only in mobile menu (hidden in navbar on mobile) */}
              <div className="px-4 py-2">
                <p className="mb-2 font-mono text-xs uppercase tracking-[0.15em] text-[var(--color-text-muted)]">
                  {t('language.switch')}
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {AVAILABLE_LANGUAGES.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        changeLanguage(lang.code);
                        setMobileOpen(false);
                      }}
                      className={cn(
                        'flex items-center justify-center gap-1.5 rounded-lg px-2 py-2 text-xs transition-colors',
                        getCurrentLanguage() === lang.code
                          ? 'bg-[var(--color-surface-elevated)] text-[var(--color-text)]'
                          : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-elevated)] hover:text-[var(--color-text)]',
                      )}
                    >
                      <span className="text-sm">{lang.flag}</span>
                      <span className="font-mono">{lang.code}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
