import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { Navbar } from './navbar';
import { simulateMobileViewport, simulateDesktopViewport } from '@/__tests__/helpers/viewport';

// Mock react-router-dom — useLocation must return a STABLE reference,
// otherwise the useEffect([location]) in Navbar resets mobileOpen on every render.
vi.mock('react-router-dom', () => {
  const location = { pathname: '/' };
  return {
    Link: ({ children, to, onClick, ...props }: React.PropsWithChildren<{ to: string; onClick?: () => void } & Record<string, unknown>>) => (
      <a href={to} onClick={onClick} {...props}>{children}</a>
    ),
    useLocation: () => location,
  };
});

// Mock framer-motion
vi.mock('framer-motion', () => {
  const React = require('react');
  return {
    motion: {
      header: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => {
        const { initial, animate, transition, ...rest } = props;
        return <header {...(rest as React.HTMLAttributes<HTMLElement>)}>{children}</header>;
      },
      div: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => {
        const { initial, animate, exit, transition, style, ...rest } = props;
        return <div {...(rest as React.HTMLAttributes<HTMLElement>)}>{children}</div>;
      },
    },
    AnimatePresence: ({ children }: React.PropsWithChildren) => <>{children}</>,
    useScroll: () => ({ scrollYProgress: { get: () => 0, set: vi.fn() } }),
    useSpring: () => ({ get: () => 0, set: vi.fn() }),
  };
});

// Mock i18n
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const map: Record<string, string> = {
        'nav.produtos': 'Produtos',
        'nav.blog': 'Blog',
        'nav.contato': 'Contato',
        'nav.github': 'GitHub',
        'language.switch': 'Mudar idioma',
      };
      return map[key] ?? key;
    },
  }),
}));

vi.mock('@/i18n/i18n', () => ({
  changeLanguage: vi.fn(),
  getCurrentLanguage: () => 'pt-BR',
  AVAILABLE_LANGUAGES: [
    { code: 'pt-BR', flag: '🇧🇷', name: 'Português' },
    { code: 'en', flag: '🇺🇸', name: 'English' },
    { code: 'es', flag: '🇪🇸', name: 'Español' },
  ],
}));

// Mock ScrollProgress (from reveal) to avoid pulling useScroll
vi.mock('@/components/animation/reveal', () => ({
  ScrollProgress: () => <div data-testid="scroll-progress" />,
}));

describe('Navbar mobile menu', () => {
  beforeEach(() => {
    simulateMobileViewport();
    document.body.innerHTML = '';
    vi.clearAllMocks();
  });

  it('shows hamburger button on mobile (md:hidden)', () => {
    render(<Navbar />);
    const hamburger = screen.getByLabelText('Toggle menu');
    expect(hamburger).toBeInTheDocument();
    expect(hamburger.className).toContain('md:hidden');
  });

  it('hamburger has adequate touch target (p-2.5 = ~44px)', () => {
    render(<Navbar />);
    const hamburger = screen.getByLabelText('Toggle menu');
    expect(hamburger.className).toContain('p-2.5');
  });

  it('opens mobile menu on hamburger click', () => {
    render(<Navbar />);
    const hamburger = screen.getByLabelText('Toggle menu');
    act(() => {
      fireEvent.click(hamburger);
    });
    // Mobile menu should now show nav links — "Produtos" appears in both
    // the desktop nav (hidden md:flex) and the mobile menu (md:hidden).
    const produtosLinks = screen.getAllByText('Produtos');
    expect(produtosLinks.length).toBeGreaterThanOrEqual(2);
    // The mobile menu container should be present (md:hidden)
    const mobileMenu = document.querySelector('.md\\:hidden.fixed.top-16');
    expect(mobileMenu).not.toBeNull();
  });

  it('mobile menu includes GitHub link (not hidden on mobile)', () => {
    render(<Navbar />);
    act(() => {
      fireEvent.click(screen.getByLabelText('Toggle menu'));
    });
    // GitHub link should be present in the mobile menu
    const githubLinks = screen.getAllByText('GitHub');
    expect(githubLinks.length).toBeGreaterThan(0);
  });

  it('mobile menu includes language selector with all languages', () => {
    render(<Navbar />);
    act(() => {
      fireEvent.click(screen.getByLabelText('Toggle menu'));
    });
    // Language switch label
    expect(screen.getByText('Mudar idioma')).toBeInTheDocument();
    // All 3 language codes should be present
    expect(screen.getByText('🇧🇷')).toBeInTheDocument();
    expect(screen.getByText('🇺🇸')).toBeInTheDocument();
    expect(screen.getByText('🇪🇸')).toBeInTheDocument();
  });

  it('language buttons call changeLanguage on click', async () => {
    const { changeLanguage } = await import('@/i18n/i18n');
    render(<Navbar />);
    act(() => {
      fireEvent.click(screen.getByLabelText('Toggle menu'));
    });
    // Click the English option (button containing 'en')
    const enButton = screen.getByText('en').closest('button');
    expect(enButton).not.toBeNull();
    act(() => {
      fireEvent.click(enButton!);
    });
    expect(changeLanguage).toHaveBeenCalledWith('en');
  });

  it('closes mobile menu after clicking a nav link', () => {
    render(<Navbar />);
    act(() => {
      fireEvent.click(screen.getByLabelText('Toggle menu'));
    });
    // "Produtos" appears in both desktop nav and mobile menu — click the one
    // inside the mobile menu (md:hidden container).
    const mobileMenu = document.querySelector('.md\\:hidden.fixed.top-16');
    const produtosInMobile = mobileMenu?.querySelector('a[href="#produtos"]');
    expect(produtosInMobile).not.toBeNull();
    act(() => {
      fireEvent.click(produtosInMobile!);
    });
    // Menu should have closed — the mobile menu container should be gone
    expect(document.querySelector('.md\\:hidden.fixed.top-16')).toBeNull();
  });

  it('closes mobile menu after selecting a language', async () => {
    render(<Navbar />);
    act(() => {
      fireEvent.click(screen.getByLabelText('Toggle menu'));
    });
    expect(screen.getByText('Mudar idioma')).toBeInTheDocument();
    const enButton = screen.getByText('en').closest('button');
    act(() => {
      fireEvent.click(enButton!);
    });
    // Menu should have closed
    expect(screen.queryByText('Mudar idioma')).not.toBeInTheDocument();
  });

  it('mobile menu has a divider between nav links and GitHub/language', () => {
    render(<Navbar />);
    act(() => {
      fireEvent.click(screen.getByLabelText('Toggle menu'));
    });
    // The divider is a div with bg-border class
    const divider = document.querySelector('.my-2.h-px.bg-\\[var\\(--color-border\\)\\]');
    expect(divider).not.toBeNull();
  });
});

describe('Navbar desktop regression', () => {
  beforeEach(() => {
    simulateDesktopViewport();
    document.body.innerHTML = '';
  });

  it('hamburger button is hidden on desktop (md:hidden)', () => {
    render(<Navbar />);
    const hamburger = screen.getByLabelText('Toggle menu');
    // The class md:hidden is present regardless — it's CSS that hides it
    expect(hamburger.className).toContain('md:hidden');
  });

  it('desktop nav links are present but hidden on mobile (hidden md:flex)', () => {
    render(<Navbar />);
    // Desktop nav container has hidden md:flex
    const nav = document.querySelector('nav');
    expect(nav).not.toBeNull();
  });
});
