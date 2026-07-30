import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { api, ApiError } from './api-client';

describe('api-client', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  describe('request helper', () => {
    it('sends GET request with Accept-Language header', async () => {
      const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
        new Response(JSON.stringify([]), { status: 200 }),
      );

      await api.products.list();

      expect(fetchSpy).toHaveBeenCalledOnce();
      const [, init] = fetchSpy.mock.calls[0];
      expect(init?.headers).toHaveProperty('Accept-Language');
    });

    it('includes credentials: include in fetch options', async () => {
      const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
        new Response(JSON.stringify([]), { status: 200 }),
      );

      await api.products.list();

      const [, init] = fetchSpy.mock.calls[0];
      expect(init?.credentials).toBe('include');
    });

    it('does not include Authorization header (SSO uses cookies)', async () => {
      const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
        new Response(JSON.stringify([]), { status: 200 }),
      );

      await api.auth.me();

      const [, init] = fetchSpy.mock.calls[0];
      const headers = init?.headers as Record<string, string>;
      expect(headers.Authorization).toBeUndefined();
    });

    it('throws ApiError on non-ok response', async () => {
      vi.spyOn(globalThis, 'fetch').mockImplementation(async () =>
        new Response(
          JSON.stringify({ error: { code: 'NOT_FOUND', message: 'Not found' } }),
          { status: 404 },
        ),
      );

      await expect(api.products.get('nope')).rejects.toThrow(ApiError);
      await expect(api.products.get('nope')).rejects.toMatchObject({
        status: 404,
        message: 'Not found',
      });
    });

    it('returns undefined for 204 No Content', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValue(
        new Response(null, { status: 204 }),
      );

      const result = await api.admin.products.delete('p1');
      expect(result).toBeUndefined();
    });

    it('sends body as JSON for POST', async () => {
      const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
        new Response(JSON.stringify({}), { status: 201 }),
      );

      await api.contact.send({ name: 'John', email: 'j@t.com', message: 'hi' });

      const [, init] = fetchSpy.mock.calls[0];
      expect(init?.method).toBe('POST');
      expect(init?.body).toBe(JSON.stringify({ name: 'John', email: 'j@t.com', message: 'hi' }));
    });

    it('appends params as query string', async () => {
      const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
        new Response(JSON.stringify({ items: [], total: 0, page: 1, limit: 10 }), { status: 200 }),
      );

      await api.articles.list({ page: 2, limit: 5 });

      const url = fetchSpy.mock.calls[0][0] as string;
      expect(url).toContain('page=2');
      expect(url).toContain('limit=5');
    });
  });
});
