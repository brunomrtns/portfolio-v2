import { describe, it, expect } from 'vitest';
import { UserRole, ArticleStatus, ProductStatus } from './index';

describe('UserRole enum', () => {
  it('has ADMIN member', () => {
    expect(UserRole.ADMIN).toBe('ADMIN');
  });
});

describe('ArticleStatus enum', () => {
  it('has DRAFT and PUBLISHED', () => {
    expect(ArticleStatus.DRAFT).toBe('DRAFT');
    expect(ArticleStatus.PUBLISHED).toBe('PUBLISHED');
  });
});

describe('ProductStatus enum', () => {
  it('has ACTIVE, COMING_SOON, ARCHIVED', () => {
    expect(ProductStatus.ACTIVE).toBe('ACTIVE');
    expect(ProductStatus.COMING_SOON).toBe('COMING_SOON');
    expect(ProductStatus.ARCHIVED).toBe('ARCHIVED');
  });
});
