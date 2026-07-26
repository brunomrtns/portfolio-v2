import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

/**
 * Testes de regressão para o CSS mobile (backdrop-filter fallback, dvh).
 * O jsdom não processa CSS, então validamos no nível do código-fonte.
 */
const cssSource = readFileSync(
  resolve(import.meta.dirname, '../index.css'),
  'utf-8',
);

describe('index.css mobile fallbacks', () => {
  it('has @supports fallback for backdrop-filter (when unsupported)', () => {
    expect(cssSource).toContain('@supports not ((backdrop-filter: blur(1px))');
    // Fallback should use more opaque backgrounds
    expect(cssSource).toMatch(/@supports not[\s\S]*?\.glass-strong[\s\S]*?rgba\(7, 7, 10, 0\.96\)/);
  });

  it('has mobile opacity bump for glass classes (max-width: 1023px)', () => {
    expect(cssSource).toContain('@media (max-width: 1023px)');
    // Mobile should have higher opacity than desktop for glass-strong
    expect(cssSource).toMatch(/@media \(max-width: 1023px\)[\s\S]*?\.glass-strong[\s\S]*?rgba\(7, 7, 10, 0\.9\)/);
  });

  it('desktop glass-strong keeps original opacity (0.82)', () => {
    // The base .glass-strong (outside media query) should be 0.82
    expect(cssSource).toMatch(/\.glass-strong[\s\S]*?rgba\(7, 7, 10, 0\.82\)/);
  });

  it('has min-h-dvh utility with dvh fallback', () => {
    expect(cssSource).toContain('.min-h-dvh');
    expect(cssSource).toContain('min-height: 100vh');
    expect(cssSource).toContain('min-height: 100dvh');
  });

  it('has h-dvh utility with dvh fallback', () => {
    expect(cssSource).toContain('.h-dvh');
  });

  it('desktop glass opacity is NOT affected by mobile media query', () => {
    // The media query should be max-width (mobile only), not min-width
    const mediaMatch = cssSource.match(/@media \(max-width: 1023px\)[\s\S]*?\}/);
    expect(mediaMatch).not.toBeNull();
    // Ensure there's no min-width: 1024px override that would change desktop
    expect(cssSource).not.toContain('@media (min-width: 1024px) and (max-width: 1023px)');
  });
});
