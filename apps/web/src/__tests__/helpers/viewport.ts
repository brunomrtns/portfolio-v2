import { vi, afterEach } from 'vitest';

/**
 * Helpers para simular viewports mobile/desktop em testes jsdom.
 * O jsdom não aplica CSS, mas os componentes leem matchMedia para
 * decidir comportamento (ex: Magnetic desabilita no touch via
 * `(hover: none), (pointer: coarse)`).
 */

type MediaQueryState = {
  matches: boolean;
  media: string;
  onchange: null;
  addListener: () => void;
  removeListener: () => void;
  addEventListener: () => void;
  removeEventListener: () => void;
  dispatchEvent: () => boolean;
};

const listeners = new Map<string, Set<(e: { matches: boolean }) => void>>();

function buildMql(query: string, matches: boolean): MediaQueryState {
  return {
    matches,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: (_type: string, cb: (e: { matches: boolean }) => void) => {
      let set = listeners.get(query);
      if (!set) {
        set = new Set();
        listeners.set(query, set);
      }
      set.add(cb);
    },
    removeEventListener: (_type: string, cb: (e: { matches: boolean }) => void) => {
      listeners.get(query)?.delete(cb);
    },
    dispatchEvent: () => false,
  };
}

/** Queries que indicam dispositivo touch / mobile. */
const TOUCH_QUERIES = ['(hover: none)', '(pointer: coarse)', '(hover: none), (pointer: coarse)'];
const MOBILE_WIDTH_QUERY = '(max-width: 640px)';

/**
 * Configura o matchMedia para simular um dispositivo mobile (touch, tela pequena).
 * Retorna uma função para restaurar o estado.
 */
export function simulateMobileViewport(): () => void {
  listeners.clear();

  window.matchMedia = vi.fn().mockImplementation((query: string) => {
    // Match touch queries (individual or combined) and mobile width
    if (TOUCH_QUERIES.includes(query) || query === MOBILE_WIDTH_QUERY) {
      return buildMql(query, true);
    }
    // Outras queries (prefers-reduced-motion, etc) — default false
    return buildMql(query, false);
  });

  return () => {
    listeners.clear();
  };
}

/**
 * Configura o matchMedia para simular um dispositivo desktop (hover, pointer fino).
 */
export function simulateDesktopViewport(): () => void {
  listeners.clear();

  window.matchMedia = vi.fn().mockImplementation((query: string) => {
    // Desktop: hover disponível, pointer fino, tela larga
    if (TOUCH_QUERIES.includes(query) || query === MOBILE_WIDTH_QUERY) {
      return buildMql(query, false);
    }
    return buildMql(query, false);
  });

  return () => {
    listeners.clear();
  };
}

afterEach(() => {
  listeners.clear();
});
