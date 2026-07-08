import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useMousePosition } from './use-mouse-position';

describe('useMousePosition', () => {
  it('starts at 0,0', () => {
    const { result } = renderHook(() => useMousePosition());
    expect(result.current).toEqual({ x: 0, y: 0 });
  });

  it('updates on mousemove', () => {
    const { result } = renderHook(() => useMousePosition());

    act(() => {
      window.dispatchEvent(new MouseEvent('mousemove', { clientX: 100, clientY: 200 }));
    });

    expect(result.current).toEqual({ x: 100, y: 200 });
  });

  it('removes listener on unmount', () => {
    const removeSpy = vi.spyOn(window, 'removeEventListener');
    const { unmount } = renderHook(() => useMousePosition());

    unmount();
    expect(removeSpy).toHaveBeenCalledWith('mousemove', expect.any(Function));
    removeSpy.mockRestore();
  });
});
