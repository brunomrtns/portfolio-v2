import { describe, it, expect } from 'vitest';
import { slugify } from './index';

describe('slugify', () => {
  it('converts plain text to slug', () => {
    expect(slugify('Hello World')).toBe('hello-world');
  });

  it('removes diacritics', () => {
    expect(slugify('São Paulo')).toBe('sao-paulo');
    expect(slugify('João café')).toBe('joao-cafe');
    expect(slugify('Überstraße')).toBe('uberstra-e');
  });

  it('replaces multiple non-alphanumeric sequences with single dash', () => {
    expect(slugify('foo   bar')).toBe('foo-bar');
    expect(slugify('foo___bar')).toBe('foo-bar');
    expect(slugify('foo!@#bar')).toBe('foo-bar');
  });

  it('trims leading and trailing dashes', () => {
    expect(slugify('---hello---')).toBe('hello');
    expect(slugify('  hello  ')).toBe('hello');
  });

  it('handles empty string', () => {
    expect(slugify('')).toBe('');
  });

  it('handles strings with only special characters', () => {
    expect(slugify('!@#$%')).toBe('');
  });

  it('preserves numbers', () => {
    expect(slugify('Product 2.0')).toBe('product-2-0');
  });

  it('handles mixed case', () => {
    expect(slugify('Trivestia Plataforma')).toBe('trivestia-plataforma');
  });
});
