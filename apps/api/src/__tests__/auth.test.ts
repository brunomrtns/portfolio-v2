import { describe, it, expect, afterEach, beforeEach, vi } from 'vitest';
import { buildApp, mockFetchOk, mockFetchUnauthorized, authCookie, mockBiUser } from './helpers';

describe('Auth routes (BI Identity SSO)', () => {
  let app: Awaited<ReturnType<typeof buildApp>>;

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(async () => {
    if (app) await app.close();
  });

  describe('GET /api/auth/sso-redirect', () => {
    it('redirects to BI Identity login', async () => {
      app = await buildApp();
      const res = await app.inject({
        method: 'GET',
        url: '/api/auth/sso-redirect',
      });

      expect(res.statusCode).toBe(302);
      expect(res.headers.location).toContain('/id/login');
      expect(res.headers.location).toContain('redirect=/portfolio/panel');
    });
  });

  describe('GET /api/auth/me', () => {
    it('returns user profile with valid cookie', async () => {
      mockFetchOk();
      app = await buildApp();

      const res = await app.inject({
        method: 'GET',
        url: '/api/auth/me',
        headers: authCookie(),
      });

      expect(res.statusCode).toBe(200);
      expect(res.json().user.email).toBe('admin@test.com');
    });

    it('returns 401 without cookie', async () => {
      app = await buildApp();
      const res = await app.inject({ method: 'GET', url: '/api/auth/me' });
      expect(res.statusCode).toBe(401);
    });

    it('returns 401 when BI Identity rejects the cookie', async () => {
      mockFetchUnauthorized();
      app = await buildApp();

      const res = await app.inject({
        method: 'GET',
        url: '/api/auth/me',
        headers: authCookie(),
      });

      expect(res.statusCode).toBe(401);
    });

    it('returns 401 when fetch fails', async () => {
      vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('Network error'));
      app = await buildApp();

      const res = await app.inject({
        method: 'GET',
        url: '/api/auth/me',
        headers: authCookie(),
      });

      expect(res.statusCode).toBe(401);
    });
  });
});
