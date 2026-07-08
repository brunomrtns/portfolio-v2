import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';

const NAV_LINKS = [
  { label: 'Sobre', href: '#sobre' },
  { label: 'Produtos', href: '#produtos' },
  { label: 'Stack', href: '#stack' },
  { label: 'Experiência', href: '#experiencia' },
  { label: 'Blog', href: '/blog' },
];

export function Navbar(): React.ReactNode {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 24);
    handler();
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location]);

  const isHome = location.pathname === '/';

  return (
    <>
      <motion.header
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className={cn(
          'fixed top-0 left-0 right-0 z-50 transition-all duration-500',
          scrolled
            ? 'glass-strong border-b border-[var(--color-border)]'
            : 'bg-transparent border-transparent',
        )}
      >
        <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          {/* Logo */}
          <Link to="/" className="group flex items-center gap-2">
            <span className="font-mono text-sm font-bold tracking-tight text-[var(--color-text)]">
              bruno<span className="text-[var(--color-accent)]">.</span>integrations
            </span>
          </Link>

          {/* Desktop nav */}
          {isHome && (
            <div className="hidden items-center gap-1 md:flex">
              {NAV_LINKS.map((link) =>
                link.href.startsWith('#') ? (
                  <a
                    key={link.href}
                    href={link.href}
                    className="rounded-lg px-4 py-2 text-sm text-[var(--color-text-secondary)] transition-colors duration-300 hover:text-[var(--color-text)] hover:bg-[var(--color-surface-elevated)]"
                  >
                    {link.label}
                  </a>
                ) : (
                  <Link
                    key={link.href}
                    to={link.href}
                    className="rounded-lg px-4 py-2 text-sm text-[var(--color-text-secondary)] transition-colors duration-300 hover:text-[var(--color-text)] hover:bg-[var(--color-surface-elevated)]"
                  >
                    {link.label}
                  </Link>
                ),
              )}
            </div>
          )}

          {/* CTA + mobile toggle */}
          <div className="flex items-center gap-3">
            <a
              href="https://github.com/brunomrtns"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden rounded-lg border border-[var(--color-border)] px-4 py-2 text-sm text-[var(--color-text-secondary)] transition-all duration-300 hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] sm:block"
            >
              GitHub
            </a>
            <button
              className="rounded-lg p-2 text-[var(--color-text-secondary)] transition-colors hover:text-[var(--color-text)] md:hidden"
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
            className="fixed top-16 left-0 right-0 z-40 glass-strong border-b border-[var(--color-border)] md:hidden"
          >
            <div className="flex flex-col gap-1 px-6 py-4">
              {NAV_LINKS.map((link) =>
                link.href.startsWith('#') ? (
                  <a
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className="rounded-lg px-4 py-3 text-sm text-[var(--color-text-secondary)] transition-colors hover:bg-[var(--color-surface-elevated)] hover:text-[var(--color-text)]"
                  >
                    {link.label}
                  </a>
                ) : (
                  <Link
                    key={link.href}
                    to={link.href}
                    className="rounded-lg px-4 py-3 text-sm text-[var(--color-text-secondary)] transition-colors hover:bg-[var(--color-surface-elevated)] hover:text-[var(--color-text)]"
                  >
                    {link.label}
                  </Link>
                ),
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
