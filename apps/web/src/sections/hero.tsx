import { motion } from 'framer-motion';
import { ArrowRight, Github, Linkedin } from 'lucide-react';

const EASE_EXPO = [0.16, 1, 0.3, 1] as const;

export function Hero(): React.ReactNode {
  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden">
      {/* Animated mesh background */}
      <div className="mesh-bg-dense" />
      <div className="noise" />

      {/* Floating orbs */}
      <motion.div
        className="absolute left-[15%] top-[20%] h-64 w-64 rounded-full bg-[var(--color-accent-glow)] blur-[100px]"
        animate={{ y: [0, -30, 0], x: [0, 20, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute right-[15%] bottom-[20%] h-80 w-80 rounded-full bg-[var(--color-accent-warm-glow)] blur-[120px]"
        animate={{ y: [0, 30, 0], x: [0, -20, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-5xl px-6 text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: EASE_EXPO }}
          className="mb-8 inline-flex items-center gap-2 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2"
        >
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--color-accent)] opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-[var(--color-accent)]" />
          </span>
          <span className="font-mono text-xs text-[var(--color-text-secondary)]">
            Disponível para projetos
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: EASE_EXPO }}
          className="font-serif text-5xl font-bold leading-[1.1] tracking-tight text-[var(--color-text)] sm:text-6xl md:text-7xl lg:text-8xl"
        >
          Engenharia de software
          <br />
          <span className="gradient-text-accent">com precisão e propósito</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: EASE_EXPO }}
          className="mx-auto mt-8 max-w-2xl text-lg text-[var(--color-text-secondary)] sm:text-xl"
        >
          Bruno Martins — Software Engineer Full Stack focado em produtos digitais
          de altíssima qualidade, automação com IA e infraestrutura escalável.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5, ease: EASE_EXPO }}
          className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row"
        >
          <a
            href="#produtos"
            className="group inline-flex h-12 items-center gap-2 rounded-lg bg-[var(--color-accent)] px-8 font-semibold text-white shadow-[0_0_24px_var(--color-accent-glow)] transition-all duration-300 hover:bg-[var(--color-accent-hover)] hover:shadow-[0_0_40px_var(--color-accent-glow)]"
          >
            Ver produtos
            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
          </a>
          <div className="flex gap-3">
            <a
              href="https://github.com/brunomrtns"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-12 w-12 items-center justify-center rounded-lg border border-[var(--color-border)] text-[var(--color-text-secondary)] transition-all duration-300 hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
              aria-label="GitHub"
            >
              <Github className="h-5 w-5" />
            </a>
            <a
              href="https://linkedin.com/in/bruno-martinss"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-12 w-12 items-center justify-center rounded-lg border border-[var(--color-border)] text-[var(--color-text-secondary)] transition-all duration-300 hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
              aria-label="LinkedIn"
            >
              <Linkedin className="h-5 w-5" />
            </a>
          </div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.2 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            className="flex h-10 w-6 items-start justify-center rounded-full border border-[var(--color-border)] p-2"
          >
            <div className="h-2 w-1 rounded-full bg-[var(--color-text-muted)]" />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
