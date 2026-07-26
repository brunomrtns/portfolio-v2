import {
  motion,
  useScroll,
  useSpring,
  useTransform,
  useMotionValue,
  type Variants,
} from 'framer-motion';
import {
  type ReactNode,
  useRef,
  type MouseEvent,
  useEffect,
  useState,
} from 'react';
import { cn } from '@/lib/utils';

const EASE_EXPO = [0.16, 1, 0.3, 1] as const;
const EASE_QUINT = [0.22, 1, 0.36, 1] as const;

/* ═══════════════════════════════════════════════════════════════════════════════
   Reveal — fade + slide + subtle scale + blur on viewport entry
   The signature animation of the site. Uses expo easing for a
   decelerating, premium feel.
   ═══════════════════════════════════════════════════════════════════════════════ */

interface RevealProps {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
  once?: boolean;
  blur?: boolean;
  scale?: boolean;
}

export function Reveal({
  children,
  delay = 0,
  y = 28,
  className,
  once = true,
  blur = true,
  scale = true,
}: RevealProps): ReactNode {
  return (
    <motion.div
      initial={{
        opacity: 0,
        y,
        filter: blur ? 'blur(10px)' : 'blur(0px)',
        scale: scale ? 0.98 : 1,
      }}
      whileInView={{
        opacity: 1,
        y: 0,
        filter: 'blur(0px)',
        scale: 1,
      }}
      viewport={{ once, margin: '-8% 0px' }}
      transition={{
        duration: 0.8,
        delay,
        ease: EASE_EXPO,
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════
   Stagger — container that staggers child animations
   ═══════════════════════════════════════════════════════════════════════════════ */

interface StaggerProps {
  children: ReactNode;
  delay?: number;
  stagger?: number;
  className?: string;
}

export function Stagger({
  children,
  delay = 0,
  stagger = 0.08,
  className,
}: StaggerProps): ReactNode {
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
      viewport={{ once: true, margin: '-8% 0px' }}
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

export function StaggerItem({
  children,
  y = 24,
  className,
}: StaggerItemProps): ReactNode {
  const itemVariants: Variants = {
    hidden: { opacity: 0, y, filter: 'blur(8px)', scale: 0.98 },
    visible: {
      opacity: 1,
      y: 0,
      filter: 'blur(0px)',
      scale: 1,
      transition: { duration: 0.7, ease: EASE_EXPO },
    },
  };
  return (
    <motion.div variants={itemVariants} className={className}>
      {children}
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════
   Parallax — scroll-based vertical parallax with spring physics
   Fixed: now uses useTransform properly for reactive movement
   ═══════════════════════════════════════════════════════════════════════════════ */

interface ParallaxProps {
  children: ReactNode;
  speed?: number;
  className?: string;
}

export function Parallax({
  children,
  speed = 0.3,
  className,
}: ParallaxProps): ReactNode {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });

  const range = speed * 60;
  const y = useTransform(scrollYProgress, [0, 1], [-range / 2, range / 2]);
  const ySpring = useSpring(y, {
    stiffness: 80,
    damping: 30,
    restDelta: 0.001,
  });

  return (
    <motion.div ref={ref} style={{ y: ySpring }} className={className}>
      {children}
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════
   MouseSpotlight — tracks mouse position and sets CSS vars for card glow
   ═══════════════════════════════════════════════════════════════════════════════ */

interface MouseSpotlightProps {
  children: ReactNode;
  className?: string;
}

export function MouseSpotlight({
  children,
  className,
}: MouseSpotlightProps): ReactNode {
  // Skip the mouse-tracking spotlight on touch devices — it's a hover-only
  // effect and adds a no-op listener on mobile.
  const [isTouch, setIsTouch] = useState(false);
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(hover: none), (pointer: coarse)');
    setIsTouch(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsTouch(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (isTouch) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    e.currentTarget.style.setProperty('--mouse-x', `${x}%`);
    e.currentTarget.style.setProperty('--mouse-y', `${y}%`);
  };

  return (
    <div className={cn('card-premium', className)} onMouseMove={handleMouseMove}>
      {children}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════
   ScrollProgress — top progress bar using scroll position
   ═══════════════════════════════════════════════════════════════════════════════ */

export function ScrollProgress(): ReactNode {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 30,
    restDelta: 0.001,
  });

  return <motion.div className="scroll-progress" style={{ scaleX }} />;
}

/* ═══════════════════════════════════════════════════════════════════════════════
   MagneticButton — wraps a button/anchor and adds a magnetic pull effect
   The element gently follows the cursor when nearby
   ═══════════════════════════════════════════════════════════════════════════════ */

interface MagneticProps {
  children: ReactNode;
  strength?: number;
  className?: string;
}

export function Magnetic({
  children,
  strength = 0.3,
  className,
}: MagneticProps): ReactNode {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const xSpring = useSpring(x, { stiffness: 150, damping: 15, restDelta: 0.001 });
  const ySpring = useSpring(y, { stiffness: 150, damping: 15, restDelta: 0.001 });

  // Skip the magnetic effect on touch / coarse pointers — it doesn't work
  // without a hover state and adds unnecessary motion listeners on mobile.
  const [isTouch, setIsTouch] = useState(false);
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(hover: none), (pointer: coarse)');
    setIsTouch(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsTouch(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (isTouch || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const distX = e.clientX - centerX;
    const distY = e.clientY - centerY;
    x.set(distX * strength);
    y.set(distY * strength);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      style={isTouch ? undefined : { x: xSpring, y: ySpring }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════
   TextReveal — word-by-word reveal for headlines
   Splits text into words and animates each with stagger
   ═══════════════════════════════════════════════════════════════════════════════ */

interface TextRevealProps {
  text: string;
  className?: string;
  delay?: number;
  highlightClassName?: string;
  highlight?: string;
}

export function TextReveal({
  text,
  className,
  delay = 0,
}: TextRevealProps): ReactNode {
  const words = text.split(' ');

  const containerVariants: Variants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.04,
        delayChildren: delay,
      },
    },
  };

  const wordVariants: Variants = {
    hidden: {
      opacity: 0,
      y: 20,
      filter: 'blur(8px)',
    },
    visible: {
      opacity: 1,
      y: 0,
      filter: 'blur(0px)',
      transition: { duration: 0.6, ease: EASE_QUINT },
    },
  };

  return (
    <motion.span
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-8% 0px' }}
      className={cn('inline-block', className)}
      aria-label={text}
    >
      {words.map((word, i) => (
        <motion.span
          key={`${word}-${i}`}
          variants={wordVariants}
          className="inline-block"
          aria-hidden
        >
          {word}
          {i < words.length - 1 ? '\u00A0' : ''}
        </motion.span>
      ))}
    </motion.span>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════
   Counter — animated number counter that triggers on viewport entry
   ═══════════════════════════════════════════════════════════════════════════════ */

interface CounterProps {
  value: string;
  className?: string;
  delay?: number;
}

export function Counter({ value, className, delay = 0 }: CounterProps): ReactNode {
  const ref = useRef<HTMLSpanElement>(null);
  const [displayValue, setDisplayValue] = useState(value);
  const [hasAnimated, setHasAnimated] = useState(false);

  // Extract numeric part for animation
  const numericMatch = value.match(/(\d+)/);
  const numericValue = numericMatch ? parseInt(numericMatch[1], 10) : 0;
  const prefix = value.slice(0, numericMatch?.index ?? 0);
  const suffix = value.slice((numericMatch?.index ?? 0) + (numericMatch?.[0].length ?? 0));

  useEffect(() => {
    if (hasAnimated || !numericMatch) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          const duration = 1200;
          const startTime = performance.now() + delay * 1000;

          const animate = (now: number) => {
            const elapsed = Math.max(0, now - startTime);
            const progress = Math.min(elapsed / duration, 1);
            // Expo ease-out
            const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
            const current = Math.round(numericValue * eased);
            setDisplayValue(`${prefix}${current}${suffix}`);

            if (progress < 1) {
              requestAnimationFrame(animate);
            }
          };
          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.3 },
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [hasAnimated, numericMatch, numericValue, prefix, suffix, delay]);

  return (
    <span ref={ref} className={className}>
      {displayValue}
    </span>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════
   SectionTransition — a glowing horizontal line that sweeps on scroll
   Placed between sections for a cinematic transition moment
   ═══════════════════════════════════════════════════════════════════════════════ */

export function SectionTransition(): ReactNode {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });

  const scaleX = useTransform(scrollYProgress, [0, 0.5, 1], [0, 1, 0]);
  const opacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0, 1, 1, 0]);

  return (
    <div ref={ref} className="relative h-px w-full overflow-visible">
      <motion.div
        style={{ scaleX, opacity }}
        className="absolute inset-0 origin-center"
      >
        <div className="h-px w-full bg-gradient-to-r from-transparent via-[var(--color-accent)] to-transparent" />
        <div className="absolute inset-0 h-8 -translate-y-4 bg-gradient-to-r from-transparent via-[var(--color-accent-glow)] to-transparent blur-xl" />
      </motion.div>
    </div>
  );
}
