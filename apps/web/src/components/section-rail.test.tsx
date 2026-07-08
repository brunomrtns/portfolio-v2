import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { SectionRail } from './section-rail';

// Mock scrollIntoView (jsdom doesn't implement it)
Element.prototype.scrollIntoView = vi.fn();

// Mock framer-motion to avoid animation complexity in tests
vi.mock('framer-motion', () => ({
  motion: {
    nav: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => {
      const { initial, animate, transition, ...rest } = props;
      return <nav {...(rest as React.HTMLAttributes<HTMLElement>)}>{children}</nav>;
    },
    div: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => {
      const { initial, animate, transition, style, ...rest } = props;
      return <div {...(rest as React.HTMLAttributes<HTMLElement>)}>{children}</div>;
    },
    span: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => {
      const { initial, animate, exit, transition, ...rest } = props;
      return <span {...(rest as React.HTMLAttributes<HTMLElement>)}>{children}</span>;
    },
  },
  AnimatePresence: ({ children }: React.PropsWithChildren) => <>{children}</>,
  useMotionValue: (initial: number) => ({ get: () => initial, set: vi.fn() }),
  useTransform: () => ({ get: () => 0, set: vi.fn() }),
  animate: vi.fn(),
}));

// Mock i18n
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const map: Record<string, string> = {
        'nav.sobre': 'Sobre',
        'nav.solucoes': 'Soluções',
        'nav.produtos': 'Produtos',
        'nav.experiencia': 'Experiência',
        'nav.stack': 'Stack',
        'nav.portfolio': 'Portfolio',
        'nav.principios': 'Princípios',
        'nav.contato': 'Contato',
      };
      return map[key] ?? key;
    },
  }),
}));

// Mock the cn utility
vi.mock('@/lib/utils', () => ({
  cn: (...classes: (string | false | undefined)[]) => classes.filter(Boolean).join(' '),
}));

describe('SectionRail', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    vi.clearAllMocks();
  });

  it('renders navigation with aria-label', () => {
    render(<SectionRail />);
    expect(screen.getByLabelText('Section navigation')).toBeInTheDocument();
  });

  it('renders a button for each section', () => {
    render(<SectionRail />);
    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(8);
  });

  it('shows section labels as aria-label', () => {
    render(<SectionRail />);
    expect(screen.getByLabelText('Sobre')).toBeInTheDocument();
    expect(screen.getByLabelText('Contato')).toBeInTheDocument();
  });

  it('scrolls to section on click', async () => {
    // Create mock elements with ids that match SECTIONS
    const sections = ['sobre', 'solucoes', 'produtos', 'experiencia', 'stack', 'portfolio', 'principios', 'contato'];
    sections.forEach((id) => {
      const el = document.createElement('div');
      el.id = id;
      document.body.appendChild(el);
    });

    render(<SectionRail />);
    const sobreBtn = screen.getByLabelText('Sobre');
    await act(async () => {
      fireEvent.click(sobreBtn);
    });

    expect(Element.prototype.scrollIntoView).toHaveBeenCalled();
  });

  it('sets aria-current on active section', () => {
    render(<SectionRail />);
    // Initially no section is active (activeId is empty)
    const buttons = screen.getAllByRole('button');
    const activeButtons = buttons.filter((b) => b.getAttribute('aria-current') === 'true');
    expect(activeButtons).toHaveLength(0);
  });
});
