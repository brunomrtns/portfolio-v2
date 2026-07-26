import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from './button';
import { simulateMobileViewport, simulateDesktopViewport } from '@/__tests__/helpers/viewport';

describe('Button', () => {
  it('renders children', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument();
  });

  it('applies default variant and size classes', () => {
    render(<Button>Default</Button>);
    const btn = screen.getByRole('button');
    expect(btn.className).toContain('inline-flex');
    expect(btn.className).toContain('h-10');
  });

  it('applies primary variant', () => {
    render(<Button variant="primary">Primary</Button>);
    const btn = screen.getByRole('button');
    expect(btn.className).toContain('bg-[var(--color-accent)]');
  });

  it('applies gradient variant', () => {
    render(<Button variant="gradient">Gradient</Button>);
    const btn = screen.getByRole('button');
    expect(btn.className).toContain('bg-gradient-to-r');
  });

  it('applies size sm', () => {
    render(<Button size="sm">Small</Button>);
    const btn = screen.getByRole('button');
    expect(btn.className).toContain('h-8');
  });

  it('applies size lg', () => {
    render(<Button size="lg">Large</Button>);
    const btn = screen.getByRole('button');
    expect(btn.className).toContain('h-12');
  });

  it('applies size icon', () => {
    render(<Button size="icon">X</Button>);
    const btn = screen.getByRole('button');
    expect(btn.className).toContain('w-10');
  });

  it('merges custom className with variant classes', () => {
    render(<Button className="custom-class">Test</Button>);
    const btn = screen.getByRole('button');
    expect(btn.className).toContain('custom-class');
  });

  it('fires onClick when clicked', async () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Click</Button>);
    await userEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('does not fire onClick when disabled', async () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick} disabled>Disabled</Button>);
    await userEvent.click(screen.getByRole('button'));
    expect(onClick).not.toHaveBeenCalled();
  });

  it('renders as child component when asChild', () => {
    render(
      <Button asChild>
        <a href="/test">Link</a>
      </Button>,
    );
    const link = screen.getByRole('link', { name: 'Link' });
    expect(link).toBeInTheDocument();
    expect(link.tagName).toBe('A');
  });

  it('forwards ref', () => {
    const ref = { current: null as HTMLButtonElement | null };
    render(<Button ref={ref}>Ref</Button>);
    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
  });
});

// ── Mobile-specific: touch targets ≥ 44px via max-sm: classes ───────────────
describe('Button mobile touch targets', () => {
  beforeEach(() => {
    simulateMobileViewport();
  });

  it('default size has mobile touch target (h-11) on top of desktop h-10', () => {
    render(<Button>Default</Button>);
    const btn = screen.getByRole('button');
    // Both classes are present in the cva output; max-sm:h-11 only applies on mobile
    expect(btn.className).toContain('h-10');
    expect(btn.className).toContain('max-sm:h-11');
  });

  it('sm size has mobile touch target (h-9) on top of desktop h-8', () => {
    render(<Button size="sm">Small</Button>);
    const btn = screen.getByRole('button');
    expect(btn.className).toContain('h-8');
    expect(btn.className).toContain('max-sm:h-9');
  });

  it('icon size has mobile touch target (h-11 w-11) on top of desktop h-10 w-10', () => {
    render(<Button size="icon">X</Button>);
    const btn = screen.getByRole('button');
    expect(btn.className).toContain('h-10');
    expect(btn.className).toContain('w-10');
    expect(btn.className).toContain('max-sm:h-11');
    expect(btn.className).toContain('max-sm:w-11');
  });

  it('lg size is unchanged (no mobile variant needed)', () => {
    render(<Button size="lg">Large</Button>);
    const btn = screen.getByRole('button');
    expect(btn.className).toContain('h-12');
    expect(btn.className).not.toContain('max-sm:h-12');
  });

  it('has active:scale feedback only on mobile (max-sm:active:scale)', () => {
    render(<Button>Click</Button>);
    const btn = screen.getByRole('button');
    expect(btn.className).toContain('max-sm:active:scale-[0.97]');
    // Should NOT have a bare active:scale that would affect desktop
    expect(btn.className).not.toMatch(/(?<!max-sm:)active:scale/);
  });
});

// ── Desktop regression: ensure desktop classes are untouched ────────────────
describe('Button desktop regression', () => {
  beforeEach(() => {
    simulateDesktopViewport();
  });

  it('default size keeps h-10 (desktop baseline)', () => {
    render(<Button>Default</Button>);
    const btn = screen.getByRole('button');
    expect(btn.className).toContain('h-10');
  });

  it('sm size keeps h-8 (desktop baseline)', () => {
    render(<Button size="sm">Small</Button>);
    const btn = screen.getByRole('button');
    expect(btn.className).toContain('h-8');
  });

  it('icon size keeps h-10 w-10 (desktop baseline)', () => {
    render(<Button size="icon">X</Button>);
    const btn = screen.getByRole('button');
    expect(btn.className).toContain('h-10');
    expect(btn.className).toContain('w-10');
  });
});
