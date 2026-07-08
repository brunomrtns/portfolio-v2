import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

/**
 * ScrollHint — a subtle narrative cue placed at the end of key sections.
 * Creates a "curiosity gap" that invites the visitor to keep scrolling.
 *
 * Not a button. Not a nav element. Just a gentle visual whisper:
 * a thin animated line + a short label that hints at what comes next.
 */
export function ScrollHint({
  labelKey,
  targetId,
}: {
  labelKey: string;
  targetId: string;
}): React.ReactNode {
  const { t } = useTranslation();

  const handleClick = () => {
    const el = document.getElementById(targetId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="mt-20 flex cursor-pointer items-center gap-3 text-[var(--color-text-muted)] transition-colors duration-300 hover:text-[var(--color-text-secondary)]"
      onClick={handleClick}
    >
      <span className="font-mono text-xs uppercase tracking-[0.15em]">
        {t(labelKey)}
      </span>
      <motion.div
        animate={{ y: [0, 4, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        className="h-8 w-px bg-gradient-to-b from-[var(--color-accent)] to-transparent"
      />
    </motion.div>
  );
}
