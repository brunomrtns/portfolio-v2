import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { api, ApiError, setAccessToken, getAccessToken } from './api-client';

describe('api-client', () => {
  beforeEach(() => {
    setAccessToken(null);
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  describe('token management', () => {
    it('setAccessToken stores in localStorage', () => {
      setAccessToken('my-token');
      expect(localStorage.getItem('portfolio_access_token')).toBe('my-token');
    });

    it('setAccessToken(null) removes from localStorage', () => {
      setAccessToken('my-token');
      setAccessToken(null);
      expect(localStorage.getItem('portfolio_access_token')).toBeNull();
    });

    it('getAccessToken reads from localStorage', () => {
      localStorage.setItem('portfolio_access_token', 'stored-token');
      // Reset the module-level cache by re-reading
      expect(getAccessToken()).toBe('stored-token');
    });
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

    it('includes auth header when auth=true', async () => {
      setAccessToken('jwt-123');
      const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
        new Response(JSON.stringify([]), { status: 200 }),
      );

      await api.auth.me();

      const [, init] = fetchSpy.mock.calls[0];
      expect((init?.headers as Record<string, string>).Authorization).toBe('Bearer jwt-123');
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
