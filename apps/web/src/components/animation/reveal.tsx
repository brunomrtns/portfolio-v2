import { motion, type Variants } from 'framer-motion';
import { type ReactNode } from 'react';

const EASE_EXPO = [0.16, 1, 0.3, 1] as const;

interface RevealProps {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
  once?: boolean;
}

/**
 * Reveal — fade + slide up animation when element enters viewport.
 */
export function Reveal({ children, delay = 0, y = 24, className, once = true }: RevealProps): ReactNode {
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, margin: '-10% 0px' }}
      transition={{ duration: 0.6, delay, ease: EASE_EXPO }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

interface StaggerProps {
  children: ReactNode;
  delay?: number;
  stagger?: number;
  className?: string;
}

/**
 * Stagger — container that staggers child animations.
 * Children should be wrapped in <StaggerItem>.
 */
export function Stagger({ children, delay = 0, stagger = 0.06, className }: StaggerProps): ReactNode {
  const containerVariants: Variants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: stagger,
        delayChildren: delay,
      },
    },
  };
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-10% 0px' }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

interface StaggerItemProps {
  children: ReactNode;
  y?: number;
  className?: string;
}

export function StaggerItem({ children, y = 20, className }: StaggerItemProps): ReactNode {
  const itemVariants: Variants = {
    hidden: { opacity: 0, y },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: EASE_EXPO },
    },
  };
  return (
    <motion.div variants={itemVariants} className={className}>
      {children}
    </motion.div>
  );
}

interface ParallaxProps {
  children: ReactNode;
  speed?: number;
  className?: string;
}

/**
 * Parallax — subtle vertical parallax on scroll.
 * speed: 0 = none, 1 = strong (keep subtle, max ~20px)
 */
export function Parallax({ children, speed = 0.3, className }: ParallaxProps): ReactNode {
  return (
    <motion.div
      initial={{ y: 0 }}
      whileInView={{ y: -speed * 20 }}
      viewport={{ margin: '-20% 0px -20% 0px' }}
      transition={{ duration: 0.8, ease: EASE_EXPO }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
