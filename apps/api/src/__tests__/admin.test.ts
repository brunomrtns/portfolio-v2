import { describe, it, expect, afterEach, beforeEach, vi } from 'vitest';
import {
  buildApp,
  mockPrisma,
  mockFetchOk,
  mockFetchUnauthorized,
  authCookie,
  mockProduct,
  mockArticle,
  mockCategory,
  mockSkill,
  mockExperience,
  mockMessage,
} from './helpers';

describe('Admin routes', () => {
  let app: Awaited<ReturnType<typeof buildApp>>;

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(async () => {
    if (app) await app.close();
  });

  async function buildAuthedApp() {
    mockFetchOk();
    app = await buildApp();
    return app;
  }

  describe('auth guard', () => {
    it('rejects all admin routes without cookie', async () => {
      app = await buildApp();
      const res = await app.inject({ method: 'GET', url: '/api/admin/products' });
      expect(res.statusCode).toBe(401);
    });

    it('rejects with invalid cookie (BI Identity 401)', async () => {
      mockFetchUnauthorized();
      app = await buildApp();
      const res = await app.inject({
        method: 'GET',
        url: '/api/admin/products',
        headers: authCookie(),
      });
      expect(res.statusCode).toBe(401);
    });
  });

  describe('Products CRUD', () => {
    it('GET /admin/products returns all products', async () => {
      mockPrisma.product.findMany.mockResolvedValue([mockProduct()]);
      app = await buildAuthedApp();

      const res = await app.inject({
        method: 'GET',
        url: '/api/admin/products',
        headers: authCookie(),
      });

      expect(res.statusCode).toBe(200);
      expect(res.json()).toHaveLength(1);
    });

    it('POST /admin/products creates a product', async () => {
      mockPrisma.product.findUnique.mockResolvedValue(null);
      mockPrisma.product.create.mockResolvedValue(mockProduct());

      app = await buildAuthedApp();
      const res = await app.inject({
        method: 'POST',
        url: '/api/admin/products',
        headers: authCookie(),
        payload: {
          name: 'Trivestia',
          tagline: 'Plataforma financeira',
          description: 'Plataforma completa',
          url: 'https://trivestia.com',
        },
      });

      expect(res.statusCode).toBe(201);
      expect(res.json().slug).toBe('trivestia');
    });

    it('POST returns 409 on duplicate slug', async () => {
      mockPrisma.product.findUnique.mockResolvedValue(mockProduct());

      app = await buildAuthedApp();
      const res = await app.inject({
        method: 'POST',
        url: '/api/admin/products',
        headers: authCookie(),
        payload: {
          name: 'Trivestia',
          tagline: 'x',
          description: 'x',
          url: 'https://x.com',
        },
      });

      expect(res.statusCode).toBe(409);
    });

    it('GET /admin/products/:id returns product by id', async () => {
      mockPrisma.product.findUnique.mockResolvedValue(mockProduct());

      app = await buildAuthedApp();
      const res = await app.inject({
        method: 'GET',
        url: '/api/admin/products/prod-1',
        headers: authCookie(),
      });

      expect(res.statusCode).toBe(200);
      expect(res.json().id).toBe('prod-1');
    });

    it('GET /admin/products/:id returns 404 for missing product', async () => {
      mockPrisma.product.findUnique.mockResolvedValue(null);

      app = await buildAuthedApp();
      const res = await app.inject({
        method: 'GET',
        url: '/api/admin/products/nope',
        headers: authCookie(),
      });

      expect(res.statusCode).toBe(404);
    });

    it('PUT /admin/products/:id updates the product', async () => {
      // First findUnique: product exists. Second: no slug conflict.
      mockPrisma.product.findUnique
        .mockResolvedValueOnce(mockProduct())
        .mockResolvedValueOnce(null);
      mockPrisma.product.update.mockResolvedValue(mockProduct({ name: 'Updated' }));

      app = await buildAuthedApp();
      const res = await app.inject({
        method: 'PUT',
        url: '/api/admin/products/prod-1',
        headers: authCookie(),
        payload: { name: 'Updated' },
      });

      expect(res.statusCode).toBe(200);
      expect(res.json().name).toBe('Updated');
    });

    it('DELETE /admin/products/:id returns 204', async () => {
      mockPrisma.product.findUnique.mockResolvedValue(mockProduct());
      mockPrisma.product.delete.mockResolvedValue(mockProduct());

      app = await buildAuthedApp();
      const res = await app.inject({
        method: 'DELETE',
        url: '/api/admin/products/prod-1',
        headers: authCookie(),
      });

      expect(res.statusCode).toBe(204);
    });

    it('DELETE returns 404 for missing product', async () => {
      mockPrisma.product.findUnique.mockResolvedValue(null);

      app = await buildAuthedApp();
      const res = await app.inject({
        method: 'DELETE',
        url: '/api/admin/products/nope',
        headers: authCookie(),
      });

      expect(res.statusCode).toBe(404);
    });
  });

  describe('Articles CRUD', () => {
    it('GET /admin/articles returns all articles', async () => {
      mockPrisma.article.findMany.mockResolvedValue([mockArticle()]);

      app = await buildAuthedApp();
      const res = await app.inject({
        method: 'GET',
        url: '/api/admin/articles',
        headers: authCookie(),
      });

      expect(res.statusCode).toBe(200);
    });

    it('POST /admin/articles creates an article', async () => {
      mockPrisma.article.findUnique.mockResolvedValue(null);
      mockPrisma.article.create.mockResolvedValue(mockArticle());

      app = await buildAuthedApp();
      const res = await app.inject({
        method: 'POST',
        url: '/api/admin/articles',
        headers: authCookie(),
        payload: {
          title: 'Hello World',
          excerpt: 'Short summary',
          content: 'Body text',
        },
      });

      expect(res.statusCode).toBe(201);
      expect(res.json().slug).toBe('hello-world');
    });

    it('PUT /admin/articles/:id updates article', async () => {
      mockPrisma.article.findUnique
        .mockResolvedValueOnce(mockArticle())
        .mockResolvedValueOnce(null);
      mockPrisma.article.update.mockResolvedValue(mockArticle({ title: 'Updated' }));

      app = await buildAuthedApp();
      const res = await app.inject({
        method: 'PUT',
        url: '/api/admin/articles/art-1',
        headers: authCookie(),
        payload: { title: 'Updated' },
      });

      expect(res.statusCode).toBe(200);
      expect(res.json().title).toBe('Updated');
    });

    it('DELETE /admin/articles/:id returns 204', async () => {
      mockPrisma.article.findUnique.mockResolvedValue(mockArticle());
      mockPrisma.article.delete.mockResolvedValue(mockArticle());

      app = await buildAuthedApp();
      const res = await app.inject({
        method: 'DELETE',
        url: '/api/admin/articles/art-1',
        headers: authCookie(),
      });

      expect(res.statusCode).toBe(204);
    });
  });

  describe('Categories CRUD', () => {
    it('GET /admin/categories returns all categories', async () => {
      mockPrisma.category.findMany.mockResolvedValue([mockCategory()]);

      app = await buildAuthedApp();
      const res = await app.inject({
        method: 'GET',
        url: '/api/admin/categories',
        headers: authCookie(),
      });

      expect(res.statusCode).toBe(200);
    });

    it('POST /admin/categories creates a category', async () => {
      mockPrisma.category.findUnique.mockResolvedValue(null);
      mockPrisma.category.create.mockResolvedValue(mockCategory());

      app = await buildAuthedApp();
      const res = await app.inject({
        method: 'POST',
        url: '/api/admin/categories',
        headers: authCookie(),
        payload: { name: 'Engenharia' },
      });

      expect(res.statusCode).toBe(201);
    });

    it('DELETE /admin/categories/:id returns 204', async () => {
      mockPrisma.category.findUnique.mockResolvedValue(mockCategory());
      mockPrisma.category.delete.mockResolvedValue(mockCategory());

      app = await buildAuthedApp();
      const res = await app.inject({
        method: 'DELETE',
        url: '/api/admin/categories/cat-1',
        headers: authCookie(),
      });

      expect(res.statusCode).toBe(204);
    });
  });

  describe('Skills CRUD', () => {
    it('GET /admin/skills returns all skills', async () => {
      mockPrisma.skill.findMany.mockResolvedValue([mockSkill()]);

      app = await buildAuthedApp();
      const res = await app.inject({
        method: 'GET',
        url: '/api/admin/skills',
        headers: authCookie(),
      });

      expect(res.statusCode).toBe(200);
    });

    it('POST /admin/skills creates a skill', async () => {
      mockPrisma.skill.create.mockResolvedValue(mockSkill());

      app = await buildAuthedApp();
      const res = await app.inject({
        method: 'POST',
        url: '/api/admin/skills',
        headers: authCookie(),
        payload: { name: 'React', category: 'Frontend' },
      });

      expect(res.statusCode).toBe(201);
    });
  });

  describe('Experience CRUD', () => {
    it('GET /admin/experience returns all entries', async () => {
      mockPrisma.experience.findMany.mockResolvedValue([mockExperience()]);

      app = await buildAuthedApp();
      const res = await app.inject({
        method: 'GET',
        url: '/api/admin/experience',
        headers: authCookie(),
      });

      expect(res.statusCode).toBe(200);
    });

    it('POST /admin/experience creates an entry', async () => {
      mockPrisma.experience.create.mockResolvedValue(mockExperience());

      app = await buildAuthedApp();
      const res = await app.inject({
        method: 'POST',
        url: '/api/admin/experience',
        headers: authCookie(),
        payload: {
          role: 'Developer',
          company: 'Acme',
          startDate: new Date('2023-01-01').toISOString(),
        },
      });

      expect(res.statusCode).toBe(201);
    });
  });

  describe('Messages', () => {
    it('GET /admin/messages returns all messages', async () => {
      mockPrisma.contactMessage.findMany.mockResolvedValue([mockMessage()]);

      app = await buildAuthedApp();
      const res = await app.inject({
        method: 'GET',
        url: '/api/admin/messages',
        headers: authCookie(),
      });

      expect(res.statusCode).toBe(200);
    });

    it('GET /admin/messages?unread=true filters unread', async () => {
      mockPrisma.contactMessage.findMany.mockResolvedValue([mockMessage()]);

      app = await buildAuthedApp();
      const res = await app.inject({
        method: 'GET',
        url: '/api/admin/messages?unread=true',
        headers: authCookie(),
      });

      expect(res.statusCode).toBe(200);
      expect(mockPrisma.contactMessage.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { read: false } }),
      );
    });

    it('PUT /admin/messages/:id/read marks as read', async () => {
      mockPrisma.contactMessage.findUnique.mockResolvedValue(mockMessage());
      mockPrisma.contactMessage.update.mockResolvedValue(mockMessage({ read: true }));

      app = await buildAuthedApp();
      const res = await app.inject({
        method: 'PUT',
        url: '/api/admin/messages/msg-1/read',
        headers: authCookie(),
      });

      expect(res.statusCode).toBe(200);
      expect(res.json().read).toBe(true);
    });

    it('DELETE /admin/messages/:id returns 204', async () => {
      mockPrisma.contactMessage.findUnique.mockResolvedValue(mockMessage());
      mockPrisma.contactMessage.delete.mockResolvedValue(mockMessage());

      app = await buildAuthedApp();
      const res = await app.inject({
        method: 'DELETE',
        url: '/api/admin/messages/msg-1',
        headers: authCookie(),
      });

      expect(res.statusCode).toBe(204);
    });
  });
});
