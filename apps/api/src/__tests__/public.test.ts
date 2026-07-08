import { describe, it, expect, afterEach } from 'vitest';
import {
  buildApp,
  mockPrisma,
  mockProduct,
  mockArticle,
  mockCategory,
  mockSkill,
  mockExperience,
} from './helpers';

describe('Public routes', () => {
  let app: Awaited<ReturnType<typeof buildApp>>;

  afterEach(async () => {
    if (app) await app.close();
  });

  describe('GET /api/products', () => {
    it('returns list of products', async () => {
      mockPrisma.product.findMany.mockResolvedValue([mockProduct(), mockProduct({ id: 'p2', slug: 'avesia' })]);

      app = await buildApp();
      const res = await app.inject({ method: 'GET', url: '/api/products' });

      expect(res.statusCode).toBe(200);
      const body = res.json();
      expect(body).toHaveLength(2);
      expect(body[0].slug).toBe('trivestia');
    });

    it('returns empty array when no products', async () => {
      mockPrisma.product.findMany.mockResolvedValue([]);

      app = await buildApp();
      const res = await app.inject({ method: 'GET', url: '/api/products' });

      expect(res.statusCode).toBe(200);
      expect(res.json()).toEqual([]);
    });
  });

  describe('GET /api/products/:slug', () => {
    it('returns product by slug', async () => {
      mockPrisma.product.findUnique.mockResolvedValue(mockProduct());

      app = await buildApp();
      const res = await app.inject({ method: 'GET', url: '/api/products/trivestia' });

      expect(res.statusCode).toBe(200);
      expect(res.json().slug).toBe('trivestia');
    });

    it('returns 404 for non-existent slug', async () => {
      mockPrisma.product.findUnique.mockResolvedValue(null);

      app = await buildApp();
      const res = await app.inject({ method: 'GET', url: '/api/products/nope' });

      expect(res.statusCode).toBe(404);
      expect(res.json().error.code).toBe('NOT_FOUND');
    });
  });

  describe('GET /api/articles', () => {
    it('returns paginated articles', async () => {
      mockPrisma.article.count.mockResolvedValue(1);
      mockPrisma.article.findMany.mockResolvedValue([mockArticle()]);

      app = await buildApp();
      const res = await app.inject({ method: 'GET', url: '/api/articles' });

      expect(res.statusCode).toBe(200);
      const body = res.json();
      expect(body.items).toHaveLength(1);
      expect(body.total).toBe(1);
      expect(body.page).toBe(1);
      expect(body.totalPages).toBe(1);
    });

    it('respects page and limit params', async () => {
      mockPrisma.article.count.mockResolvedValue(25);
      mockPrisma.article.findMany.mockResolvedValue([mockArticle()]);

      app = await buildApp();
      const res = await app.inject({ method: 'GET', url: '/api/articles?page=2&limit=10' });

      expect(res.statusCode).toBe(200);
      const body = res.json();
      expect(body.page).toBe(2);
      expect(body.limit).toBe(10);
      expect(body.totalPages).toBe(3);
    });

    it('caps limit at 50', async () => {
      mockPrisma.article.count.mockResolvedValue(0);
      mockPrisma.article.findMany.mockResolvedValue([]);

      app = await buildApp();
      const res = await app.inject({ method: 'GET', url: '/api/articles?limit=100' });

      expect(res.json().limit).toBe(50);
    });

    it('clamps page to minimum 1', async () => {
      mockPrisma.article.count.mockResolvedValue(0);
      mockPrisma.article.findMany.mockResolvedValue([]);

      app = await buildApp();
      const res = await app.inject({ method: 'GET', url: '/api/articles?page=0' });

      expect(res.json().page).toBe(1);
    });
  });

  describe('GET /api/articles/:slug', () => {
    it('returns published article by slug', async () => {
      mockPrisma.article.findUnique.mockResolvedValue(mockArticle());

      app = await buildApp();
      const res = await app.inject({ method: 'GET', url: '/api/articles/hello-world' });

      expect(res.statusCode).toBe(200);
      expect(res.json().slug).toBe('hello-world');
    });

    it('returns 404 for draft article', async () => {
      mockPrisma.article.findUnique.mockResolvedValue(mockArticle({ status: 'DRAFT' }));

      app = await buildApp();
      const res = await app.inject({ method: 'GET', url: '/api/articles/hello-world' });

      expect(res.statusCode).toBe(404);
    });

    it('returns 404 for non-existent slug', async () => {
      mockPrisma.article.findUnique.mockResolvedValue(null);

      app = await buildApp();
      const res = await app.inject({ method: 'GET', url: '/api/articles/nope' });

      expect(res.statusCode).toBe(404);
    });
  });

  describe('GET /api/categories', () => {
    it('returns categories with article count', async () => {
      mockPrisma.category.findMany.mockResolvedValue([mockCategory()]);

      app = await buildApp();
      const res = await app.inject({ method: 'GET', url: '/api/categories' });

      expect(res.statusCode).toBe(200);
      const body = res.json();
      expect(body[0].articleCount).toBe(3);
    });
  });

  describe('GET /api/skills', () => {
    it('returns skills ordered by category and order', async () => {
      mockPrisma.skill.findMany.mockResolvedValue([
        mockSkill(),
        mockSkill({ id: 's2', name: 'TypeScript', order: 1 }),
      ]);

      app = await buildApp();
      const res = await app.inject({ method: 'GET', url: '/api/skills' });

      expect(res.statusCode).toBe(200);
      expect(res.json()).toHaveLength(2);
    });
  });

  describe('GET /api/experience', () => {
    it('returns experience entries', async () => {
      mockPrisma.experience.findMany.mockResolvedValue([mockExperience()]);

      app = await buildApp();
      const res = await app.inject({ method: 'GET', url: '/api/experience' });

      expect(res.statusCode).toBe(200);
      expect(res.json()[0].company).toBe('Acme');
    });
  });

  describe('POST /api/contact', () => {
    it('creates a contact message and returns 201', async () => {
      mockPrisma.contactMessage.create.mockResolvedValue({
        id: 'msg-1',
        name: 'John',
        email: 'john@test.com',
        message: 'Hello',
        read: false,
        createdAt: new Date(),
      });

      app = await buildApp();
      const res = await app.inject({
        method: 'POST',
        url: '/api/contact',
        payload: { name: 'John', email: 'john@test.com', message: 'Hello there' },
      });

      expect(res.statusCode).toBe(201);
      expect(res.json().id).toBe('msg-1');
    });

    it('returns 400 on missing fields', async () => {
      app = await buildApp();
      const res = await app.inject({
        method: 'POST',
        url: '/api/contact',
        payload: { name: 'John' },
      });

      expect(res.statusCode).toBe(400);
    });

    it('returns 400 on invalid email', async () => {
      app = await buildApp();
      const res = await app.inject({
        method: 'POST',
        url: '/api/contact',
        payload: { name: 'John', email: 'bad', message: 'hi' },
      });

      expect(res.statusCode).toBe(400);
    });
  });
});
