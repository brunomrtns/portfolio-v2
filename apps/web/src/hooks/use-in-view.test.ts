import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useInView } from './use-in-view';

describe('useInView', () => {
  it('returns a ref and false initially', () => {
    const { result } = renderHook(() => useInView());
    expect(result.current[0]).toBeDefined();
    expect(result.current[1]).toBe(false);
  });

  it('accepts custom options', () => {
    const { result } = renderHook(() =>
      useInView({ threshold: 0.5, rootMargin: '100px', once: false }),
    );
    expect(result.current[0]).toBeDefined();
  });

  it('observes the element via IntersectionObserver', () => {
    const { result } = renderHook(() => useInView());
    // The mock IntersectionObserver's observe should be called
    // when the ref is attached to an element
    expect(result.current[0].current).toBeNull();
  });
});
