import { useEffect, useState } from 'react';

/**
 * useMousePosition — tracks mouse position relative to viewport.
 * Used for parallax and glow-follow effects.
 */
export function useMousePosition(): { x: number; y: number } {
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handler, { passive: true });
    return () => window.removeEventListener('mousemove', handler);
  }, []);

  return position;
}
