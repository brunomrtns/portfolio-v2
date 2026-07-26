import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { Hero } from './hero';
import { simulateMobileViewport, simulateDesktopViewport } from '@/__tests__/helpers/viewport';

// Mock framer-motion — renders motion.X as plain X elements, dropping motion props
vi.mock('framer-motion', () => {
  const React = require('react');
  const make = (Tag: string) => ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => {
    const { initial, animate, exit, transition, whileInView, viewport, variants, style, ...rest } = props;
    return React.createElement(Tag, rest, children);
  };
  return {
    motion: new Proxy({}, {
      get: (_t: unknown, key: string) => make(key),
    }),
    useScroll: () => ({ scrollYProgress: { get: () => 0, set: vi.fn(), on: vi.fn() } }),
    useTransform: () => ({ get: () => 0, set: vi.fn() }),
    useMotionValue: (initial: number) => ({ get: () => initial, set: vi.fn() }),
    useSpring: () => ({ get: () => 0, set: vi.fn() }),
  };
});

// Mock i18n
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const map: Record<string, string> = {
        'hero.badge': 'Badge',
        'hero.ctaProducts': 'Ver produtos',
        'hero.ctaGithub': 'GitHub',
        'hero.ctaLinkedin': 'LinkedIn',
        'hero.statsHeader': 'Stats',
        'hero.location': 'São Paulo, Brasil',
        'hero.scrollHint': 'Scroll',
      };
      return map[key] ?? key;
    },
  }),
}));

// Mock Magnetic and Counter from reveal to avoid complex dependencies
vi.mock('@/components/animation/reveal', () => ({
  Magnetic: ({ children, className }: { children: ReactNode; className?: string }) => (
    <div className={className}>{children}</div>
  ),
  Counter: ({ value, className }: { value: string; className?: string }) => (
    <span className={className}>{value}</span>
  ),
}));

describe('Hero mobile', () => {
  beforeEach(() => {
    simulateMobileViewport();
  });

  it('renders the section with min-h-dvh (not min-h-screen)', () => {
    render(<Hero />);
    const section = document.querySelector('section');
    expect(section).not.toBeNull();
    expect(section?.className).toContain('min-h-dvh');
    expect(section?.className).not.toContain('min-h-screen');
  });

  it('headline has mobile base size (text-4xl) with sm:text-6xl', () => {
    render(<Hero />);
    const h1 = screen.getByRole('heading', { level: 1 });
    expect(h1.className).toContain('text-4xl');
    expect(h1.className).toContain('sm:text-6xl');
  });

  it('shows compact mobile stats grid (lg:hidden)', () => {
    render(<Hero />);
    // The mobile stats card should be present with lg:hidden class
    const mobileStats = document.querySelector('.lg\\:hidden.mt-10');
    expect(mobileStats).not.toBeNull();
  });

  it('desktop stats card is hidden on mobile (hidden lg:block)', () => {
    render(<Hero />);
    const desktopStats = document.querySelector('.hidden.lg\\:block');
    expect(desktopStats).not.toBeNull();
  });

  it('aurora orbs have mobile-reduced sizes with sm: variants', () => {
    render(<Hero />);
    // The first orb should have h-40 w-40 sm:h-72 sm:w-72 (reduced on mobile)
    const orbs = document.querySelectorAll('[class*="rounded-full"][class*="blur-"]');
    expect(orbs.length).toBeGreaterThan(0);
    // At least one orb should have the mobile size h-40
    const hasMobileOrb = Array.from(orbs).some((orb) =>
      orb.className.includes('h-40') && orb.className.includes('sm:h-72'),
    );
    expect(hasMobileOrb).toBe(true);
  });

  it('content has mobile padding (pt-12 pb-28) without affecting desktop (sm:py-20)', () => {
    render(<Hero />);
    const content = document.querySelector('.container-wide.relative.z-10');
    expect(content).not.toBeNull();
    expect(content?.className).toContain('pt-12');
    expect(content?.className).toContain('pb-28');
    expect(content?.className).toContain('sm:py-20');
  });

  it('hero grid has reduced gap on mobile (gap-10 sm:gap-16)', () => {
    render(<Hero />);
    const grid = document.querySelector('.grid.items-center');
    expect(grid).not.toBeNull();
    expect(grid?.className).toContain('gap-10');
    expect(grid?.className).toContain('sm:gap-16');
  });
});

describe('Hero desktop regression', () => {
  beforeEach(() => {
    simulateDesktopViewport();
  });

  it('section uses min-h-dvh (with dvh fallback)', () => {
    render(<Hero />);
    const section = document.querySelector('section');
    expect(section?.className).toContain('min-h-dvh');
  });

  it('headline keeps desktop sizes (sm:text-6xl lg:text-7xl)', () => {
    render(<Hero />);
    const h1 = screen.getByRole('heading', { level: 1 });
    expect(h1.className).toContain('sm:text-6xl');
    expect(h1.className).toContain('lg:text-7xl');
    expect(h1.className).toContain('xl:text-[5.5rem]');
  });

  it('content has sm:py-20 (desktop padding preserved)', () => {
    render(<Hero />);
    const content = document.querySelector('.container-wide.relative.z-10');
    expect(content?.className).toContain('sm:py-20');
  });
});
