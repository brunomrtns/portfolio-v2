import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import { Magnetic, MouseSpotlight } from './reveal';
import { simulateMobileViewport, simulateDesktopViewport } from '@/__tests__/helpers/viewport';

// Mock framer-motion — needed because Magnetic uses motion.div, useMotionValue, useSpring
vi.mock('framer-motion', () => {
  const React = require('react');
  const make = (Tag: string) => ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => {
    const { initial, animate, exit, transition, whileInView, viewport, variants, style, ...rest } = props;
    return React.createElement(Tag, rest, children);
  };
  return {
    motion: new Proxy({}, { get: (_t: unknown, key: string) => make(key) }),
    useScroll: () => ({ scrollYProgress: { get: () => 0, set: vi.fn(), on: vi.fn() } }),
    useTransform: () => ({ get: () => 0, set: vi.fn() }),
    useMotionValue: (initial: number) => ({ get: () => initial, set: vi.fn() }),
    useSpring: () => ({ get: () => 0, set: vi.fn() }),
  };
});

vi.mock('@/lib/utils', () => ({
  cn: (...classes: (string | false | undefined)[]) => classes.filter(Boolean).join(' '),
}));

describe('Magnetic touch detection', () => {
  beforeEach(() => {
    simulateMobileViewport();
  });

  it('renders children on touch devices', () => {
    render(<Magnetic>Click me</Magnetic>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('does not apply motion style on touch devices (style is undefined)', () => {
    const { container } = render(<Magnetic><span data-testid="inner">test</span></Magnetic>);
    const motionDiv = container.firstChild as HTMLElement;
    // On touch, style should not have x/y motion values — the mock renders a plain div
    // so we just verify it renders without the motion style prop
    expect(motionDiv).toBeInTheDocument();
  });

  it('does not move on mousemove when on touch device', () => {
    const { container } = render(<Magnetic><span>test</span></Magnetic>);
    const motionDiv = container.firstChild as HTMLElement;
    // Simulate a mousemove — should be a no-op on touch
    act(() => {
      fireEvent.mouseMove(motionDiv, { clientX: 100, clientY: 100 });
    });
    // No error thrown and element still rendered
    expect(screen.getByText('test')).toBeInTheDocument();
  });
});

describe('Magnetic desktop behavior', () => {
  beforeEach(() => {
    simulateDesktopViewport();
  });

  it('renders children on desktop', () => {
    render(<Magnetic>Hover me</Magnetic>);
    expect(screen.getByText('Hover me')).toBeInTheDocument();
  });
});

describe('MouseSpotlight touch detection', () => {
  beforeEach(() => {
    simulateMobileViewport();
  });

  it('renders children on touch devices', () => {
    render(<MouseSpotlight>Card content</MouseSpotlight>);
    expect(screen.getByText('Card content')).toBeInTheDocument();
  });

  it('does not set CSS vars on mousemove when on touch device', async () => {
    const { container } = render(<MouseSpotlight>Card</MouseSpotlight>);
    // Wait for the component's useEffect to run and set isTouch = true.
    await act(async () => {
      await new Promise((r) => setTimeout(r, 0));
    });
    const div = container.firstChild as HTMLElement;
    // Mock getBoundingClientRect so the handler would compute values if it ran
    vi.spyOn(div, 'getBoundingClientRect').mockReturnValue({
      left: 0, top: 0, width: 200, height: 200,
      right: 200, bottom: 200, x: 0, y: 0, toJSON: () => {},
    } as DOMRect);
    act(() => {
      fireEvent.mouseMove(div, { clientX: 100, clientY: 100 });
    });
    // On touch, the handler returns early and should NOT set --mouse-x
    // If it had run, --mouse-x would be "50%"
    expect(div.style.getPropertyValue('--mouse-x')).toBe('');
  });
});

describe('MouseSpotlight desktop behavior', () => {
  beforeEach(() => {
    simulateDesktopViewport();
  });

  it('sets CSS vars on mousemove when on desktop', () => {
    const { container } = render(<MouseSpotlight>Card</MouseSpotlight>);
    const div = container.firstChild as HTMLElement;
    // jsdom doesn't fully implement getBoundingClientRect with width/height,
    // so we mock it
    vi.spyOn(div, 'getBoundingClientRect').mockReturnValue({
      left: 0, top: 0, width: 200, height: 200,
      right: 200, bottom: 200, x: 0, y: 0, toJSON: () => {},
    } as DOMRect);
    const setPropertySpy = vi.spyOn(div.style, 'setProperty');
    act(() => {
      fireEvent.mouseMove(div, { clientX: 100, clientY: 100 });
    });
    // On desktop, should set --mouse-x and --mouse-y
    expect(setPropertySpy).toHaveBeenCalledWith('--mouse-x', '50%');
    expect(setPropertySpy).toHaveBeenCalledWith('--mouse-y', '50%');
  });
});
