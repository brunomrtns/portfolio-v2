import { describe, it, expect } from 'vitest';
import {
  loginSchema,
  createArticleSchema,
  updateArticleSchema,
  createCategorySchema,
  createProductSchema,
  updateProductSchema,
  createSkillSchema,
  createExperienceSchema,
  contactSchema,
} from './index';

describe('loginSchema', () => {
  it('accepts valid email + password', () => {
    const parsed = loginSchema.parse({ email: 'bruno@test.com', password: '123' });
    expect(parsed.email).toBe('bruno@test.com');
  });

  it('rejects invalid email', () => {
    expect(() => loginSchema.parse({ email: 'not-an-email', password: '123' })).toThrow();
  });

  it('rejects empty password', () => {
    expect(() => loginSchema.parse({ email: 'a@b.com', password: '' })).toThrow();
  });
});

describe('createArticleSchema', () => {
  const valid = {
    title: 'Hello World',
    excerpt: 'Short summary',
    content: 'Body text here',
  };

  it('accepts a minimal valid article', () => {
    const parsed = createArticleSchema.parse(valid);
    expect(parsed.title).toBe('Hello World');
    expect(parsed.status).toBe('DRAFT');
  });

  it('defaults status to DRAFT', () => {
    const { status } = createArticleSchema.parse(valid);
    expect(status).toBe('DRAFT');
  });

  it('accepts PUBLISHED with publishedAt', () => {
    const parsed = createArticleSchema.parse({
      ...valid,
      status: 'PUBLISHED',
      publishedAt: new Date().toISOString(),
    });
    expect(parsed.status).toBe('PUBLISHED');
  });

  it('rejects title over 200 chars', () => {
    expect(() => createArticleSchema.parse({ ...valid, title: 'a'.repeat(201) })).toThrow();
  });

  it('rejects empty excerpt', () => {
    expect(() => createArticleSchema.parse({ ...valid, excerpt: '' })).toThrow();
  });

  it('rejects invalid status enum', () => {
    expect(() => createArticleSchema.parse({ ...valid, status: 'ARCHIVED' })).toThrow();
  });

  it('accepts optional slug override', () => {
    const parsed = createArticleSchema.parse({ ...valid, slug: 'custom-slug' });
    expect(parsed.slug).toBe('custom-slug');
  });
});

describe('updateArticleSchema', () => {
  it('accepts partial updates', () => {
    const parsed = updateArticleSchema.parse({ title: 'New Title' });
    expect(parsed.title).toBe('New Title');
  });

  it('accepts empty object', () => {
    expect(() => updateArticleSchema.parse({})).not.toThrow();
  });
});

describe('createCategorySchema', () => {
  it('accepts valid category', () => {
    const parsed = createCategorySchema.parse({ name: 'Engenharia' });
    expect(parsed.color).toBe('#71717a');
  });

  it('accepts custom hex color', () => {
    const parsed = createCategorySchema.parse({ name: 'Dev', color: '#ff5733' });
    expect(parsed.color).toBe('#ff5733');
  });

  it('rejects invalid color format', () => {
    expect(() => createCategorySchema.parse({ name: 'Dev', color: 'red' })).toThrow();
  });

  it('rejects 3-digit hex', () => {
    expect(() => createCategorySchema.parse({ name: 'Dev', color: '#fff' })).toThrow();
  });
});

describe('createProductSchema', () => {
  const valid = {
    name: 'Trivestia',
    tagline: 'Plataforma financeira',
    description: 'Plataforma completa',
    url: 'https://trivestia.com',
  };

  it('accepts a minimal valid product', () => {
    const parsed = createProductSchema.parse(valid);
    expect(parsed.status).toBe('ACTIVE');
    expect(parsed.featured).toBe(false);
    expect(parsed.tech).toEqual([]);
  });

  it('rejects invalid url', () => {
    expect(() => createProductSchema.parse({ ...valid, url: 'not-a-url' })).toThrow();
  });

  it('accepts COMING_SOON status', () => {
    const parsed = createProductSchema.parse({ ...valid, status: 'COMING_SOON' });
    expect(parsed.status).toBe('COMING_SOON');
  });

  it('rejects name over 100 chars', () => {
    expect(() => createProductSchema.parse({ ...valid, name: 'a'.repeat(101) })).toThrow();
  });

  it('defaults tech and features to empty arrays', () => {
    const parsed = createProductSchema.parse(valid);
    expect(parsed.tech).toEqual([]);
    expect(parsed.features).toEqual([]);
  });
});

describe('updateProductSchema', () => {
  it('accepts partial update', () => {
    const parsed = updateProductSchema.parse({ name: 'Updated' });
    expect(parsed.name).toBe('Updated');
  });
});

describe('createSkillSchema', () => {
  it('accepts valid skill', () => {
    const parsed = createSkillSchema.parse({ name: 'React', category: 'Frontend' });
    expect(parsed.order).toBe(0);
  });

  it('rejects empty name', () => {
    expect(() => createSkillSchema.parse({ name: '', category: 'Frontend' })).toThrow();
  });
});

describe('createExperienceSchema', () => {
  const valid = {
    role: 'Developer',
    company: 'Acme',
    startDate: new Date('2023-01-01').toISOString(),
  };

  it('accepts valid experience', () => {
    const parsed = createExperienceSchema.parse(valid);
    expect(parsed.current).toBe(false);
    expect(parsed.achievements).toEqual([]);
  });

  it('rejects invalid startDate', () => {
    expect(() => createExperienceSchema.parse({ ...valid, startDate: 'yesterday' })).toThrow();
  });

  it('accepts nullable endDate', () => {
    const parsed = createExperienceSchema.parse({ ...valid, endDate: null });
    expect(parsed.endDate).toBeNull();
  });
});

describe('contactSchema', () => {
  it('accepts valid contact form', () => {
    const parsed = contactSchema.parse({
      name: 'Bruno',
      email: 'bruno@test.com',
      message: 'Hello there',
    });
    expect(parsed.name).toBe('Bruno');
  });

  it('rejects message over 5000 chars', () => {
    expect(() =>
      contactSchema.parse({ name: 'B', email: 'b@t.com', message: 'x'.repeat(5001) }),
    ).toThrow();
  });

  it('rejects invalid email', () => {
    expect(() => contactSchema.parse({ name: 'B', email: 'bad', message: 'hi' })).toThrow();
  });

  it('rejects empty name', () => {
    expect(() => contactSchema.parse({ name: '', email: 'b@t.com', message: 'hi' })).toThrow();
  });
});
