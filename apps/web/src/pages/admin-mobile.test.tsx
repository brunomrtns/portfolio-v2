import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

/**
 * Testes de regressão para as classes mobile do Admin.
 * O Admin tem muitas dependências (auth, API, form) que tornam o teste
 * de renderização frágil. Em vez disso, validamos que as classes CSS
 * mobile-first estão presentes no código-fonte.
 */
const adminSource = readFileSync(
  resolve(import.meta.dirname, './admin.tsx'),
  'utf-8',
);

describe('Admin mobile classes (source-level regression)', () => {
  it('tabs container has max-sm:overflow-x-auto for mobile scroll', () => {
    expect(adminSource).toContain('max-sm:overflow-x-auto');
    expect(adminSource).toContain('max-sm:pb-1');
  });

  it('article cards have flex-col with sm:flex-row for mobile stack', () => {
    expect(adminSource).toContain('flex flex-col gap-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-4 sm:flex-row sm:items-center sm:justify-between');
  });

  it('product cards have flex-col with sm:flex-row for mobile stack', () => {
    // The product card uses the same pattern
    expect(adminSource).toMatch(/product\.id[\s\S]*?flex flex-col gap-3[\s\S]*?sm:flex-row sm:items-center sm:justify-between/);
  });

  it('message cards have flex-col with sm:flex-row for mobile stack', () => {
    expect(adminSource).toContain('flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between');
  });

  it('action buttons use self-end on mobile, self-auto on desktop', () => {
    expect(adminSource).toContain('self-end sm:self-auto');
  });

  it('uses min-h-dvh instead of min-h-screen (mobile address bar fix)', () => {
    expect(adminSource).toContain('min-h-dvh');
    expect(adminSource).not.toContain('min-h-screen');
  });

  it('textarea keeps rows={16} (desktop baseline preserved)', () => {
    expect(adminSource).toContain('rows={16}');
  });
});
