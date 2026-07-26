import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import type { ReactNode } from 'react';
import { About } from './about';
import { Solutions } from './solutions';
import { Products } from './products';
import { Principles } from './principles';
import { Brand } from './brand';
import { Experience } from './experience';
import { Education } from './education';
import { Stack } from './stack';
import { Contact } from './contact';
import { PortfolioAbout } from './portfolio-about';
import { simulateMobileViewport, simulateDesktopViewport } from '@/__tests__/helpers/viewport';

// Mock framer-motion
vi.mock('framer-motion', () => {
  const React = require('react');
  const make = (Tag: string) => ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => {
    const { initial, animate, exit, transition, whileInView, viewport, variants, style, ...rest } = props;
    return React.createElement(Tag, rest, children);
  };
  return {
    motion: new Proxy({}, { get: (_t: unknown, key: string) => make(key) }),
    AnimatePresence: ({ children }: React.PropsWithChildren) => <>{children}</>,
    useScroll: () => ({ scrollYProgress: { get: () => 0, set: vi.fn(), on: vi.fn() } }),
    useTransform: () => ({ get: () => 0, set: vi.fn() }),
    useMotionValue: (initial: number) => ({ get: () => initial, set: vi.fn() }),
    useSpring: () => ({ get: () => 0, set: vi.fn() }),
  };
});

// Mock i18n
vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
  initReactI18next: { type: '3rdParty', init: () => {} },
}));

// Mock API hooks
vi.mock('@/hooks/use-data', () => ({
  useProducts: () => ({
    data: [{
      id: '1', name: 'Test Product', tagline: 'Test', description: 'Test',
      status: 'ACTIVE', featured: true,
      liveUrl: '#', repoUrl: '#', tech: ['React'],
    }],
    isLoading: false,
  }),
  useExperience: () => ({ data: [], isLoading: false }),
  useSkills: () => ({ data: [], isLoading: false }),
}));

// Mock ScrollHint (used by Stack)
vi.mock('@/components/scroll-hint', () => ({
  ScrollHint: () => <div data-testid="scroll-hint" />,
}));

// Mock reveal to avoid pulling complex animation deps
vi.mock('@/components/animation/reveal', () => {
  const React = require('react');
  return {
    Reveal: ({ children, className }: { children: ReactNode; className?: string }) => (
      <div className={className}>{children}</div>
    ),
    Stagger: ({ children, className }: { children: ReactNode; className?: string }) => (
      <div className={className}>{children}</div>
    ),
    StaggerItem: ({ children, className }: { children: ReactNode; className?: string }) => (
      <div className={className}>{children}</div>
    ),
    Parallax: ({ children, className }: { children: ReactNode; className?: string }) => (
      <div className={className}>{children}</div>
    ),
    MouseSpotlight: ({ children, className }: { children: ReactNode; className?: string }) => (
      <div className={className}>{children}</div>
    ),
    ScrollProgress: () => <div data-testid="scroll-progress" />,
    Magnetic: ({ children, className }: { children: ReactNode; className?: string }) => (
      <div className={className}>{children}</div>
    ),
    TextReveal: ({ text, className }: { text: string; className?: string }) => (
      <span className={className}>{text}</span>
    ),
    Counter: ({ value, className }: { value: string; className?: string }) => (
      <span className={className}>{value}</span>
    ),
    SectionTransition: () => <div data-testid="section-transition" />,
  };
});

// Helper: find the first <section> element in the rendered output
function getSection(): HTMLElement {
  const section = document.querySelector('section');
  if (!section) throw new Error('No <section> element found');
  return section as HTMLElement;
}

// Sections that should have reduced mobile padding (py-20 sm:py-32)
const PY20_SECTIONS = [
  { name: 'About', Component: About, id: 'sobre' },
  { name: 'Solutions', Component: Solutions, id: 'solucoes' },
  { name: 'Products', Component: Products, id: 'produtos' },
  { name: 'PortfolioAbout', Component: PortfolioAbout, id: 'portfolio' },
  { name: 'Principles', Component: Principles, id: 'principios' },
];

// Sections that should have py-24 sm:py-36
const PY24_SECTIONS = [
  { name: 'Experience', Component: Experience, id: 'experiencia' },
  { name: 'Education', Component: Education, id: 'educacao' },
  { name: 'Stack', Component: Stack, id: 'stack' },
  { name: 'Contact', Component: Contact, id: 'contato' },
];

describe('Sections mobile padding (reduced without affecting desktop)', () => {
  beforeEach(() => {
    simulateMobileViewport();
  });

  it.each(PY20_SECTIONS)('$name has py-20 sm:py-32 (mobile reduced, desktop preserved)', ({ Component }) => {
    render(<Component />);
    const section = getSection();
    expect(section.className).toContain('py-20');
    expect(section.className).toContain('sm:py-32');
  });

  it.each(PY24_SECTIONS)('$name has py-24 sm:py-36 (mobile reduced, desktop preserved)', ({ Component }) => {
    render(<Component />);
    const section = getSection();
    expect(section.className).toContain('py-24');
    expect(section.className).toContain('sm:py-36');
  });

  it('Brand has py-16 sm:py-24 (mobile reduced, desktop preserved)', () => {
    render(<Brand />);
    const section = getSection();
    expect(section.className).toContain('py-16');
    expect(section.className).toContain('sm:py-24');
  });
});

describe('Sections desktop padding regression', () => {
  beforeEach(() => {
    simulateDesktopViewport();
  });

  it.each(PY20_SECTIONS)('$name keeps sm:py-32 on desktop', ({ Component }) => {
    render(<Component />);
    const section = getSection();
    expect(section.className).toContain('sm:py-32');
  });

  it.each(PY24_SECTIONS)('$name keeps sm:py-36 on desktop', ({ Component }) => {
    render(<Component />);
    const section = getSection();
    expect(section.className).toContain('sm:py-36');
  });
});

describe('Sections section label margin (mb-8 sm:mb-16)', () => {
  beforeEach(() => {
    simulateMobileViewport();
  });

  it.each(PY20_SECTIONS.concat(PY24_SECTIONS))(
    '$name has mb-8 sm:mb-16 on section label',
    ({ Component }) => {
      render(<Component />);
      // The section label div has the class pattern "mb-8 sm:mb-16 flex items-center gap-3"
      const label = document.querySelector('.mb-8.sm\\:mb-16');
      expect(label).not.toBeNull();
    },
  );
});

describe('Sections large orbs reduced on mobile', () => {
  beforeEach(() => {
    simulateMobileViewport();
  });

  it('Education has h-40 w-40 sm:h-80 sm:w-80 orb (reduced on mobile)', () => {
    render(<Education />);
    const orb = document.querySelector('[class*="h-40"][class*="sm:h-80"]');
    expect(orb).not.toBeNull();
  });

  it('PortfolioAbout has h-40 w-40 sm:h-80 sm:w-80 orb (reduced on mobile)', () => {
    render(<PortfolioAbout />);
    const orb = document.querySelector('[class*="h-40"][class*="sm:h-80"]');
    expect(orb).not.toBeNull();
  });

  it('Products has h-40 w-40 sm:h-80 sm:w-80 orb (reduced on mobile)', () => {
    const { container } = render(<Products />);
    // The featured orb has h-40 w-40 sm:h-80 sm:w-80 — search all elements
    const orbs = container.querySelectorAll('[class*="rounded-full"][class*="blur-3xl"]');
    const hasReducedOrb = Array.from(orbs).some((orb) =>
      orb.className.includes('h-40') && orb.className.includes('sm:h-80'),
    );
    expect(hasReducedOrb).toBe(true);
  });
});

describe('Products typography mobile', () => {
  beforeEach(() => {
    simulateMobileViewport();
  });

  it('product initial has text-5xl sm:text-7xl (mobile reduced, desktop preserved)', () => {
    render(<Products />);
    // The product initial is a <p> with font-serif text-5xl ... sm:text-7xl
    const initial = document.querySelector('.font-serif.text-5xl');
    expect(initial).not.toBeNull();
    expect(initial?.className).toContain('sm:text-7xl');
  });
});
