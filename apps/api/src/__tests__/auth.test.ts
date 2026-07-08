import { describe, it, expect, afterEach, vi } from 'vitest';
import { buildApp, mockPrisma, makeAuthToken, authHeader, mockUser } from './helpers';
import { comparePassword } from '@portfolio/shared';

vi.mock('@portfolio/shared', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@portfolio/shared')>();
  return {
    ...actual,
    comparePassword: vi.fn(),
  };
});

describe('Auth routes', () => {
  let app: Awaited<ReturnType<typeof buildApp>>;

  afterEach(async () => {
    if (app) await app.close();
  });

  describe('POST /api/auth/login', () => {
    it('returns 200 with token on valid credentials', async () => {
      vi.mocked(comparePassword).mockResolvedValue(true);
      mockPrisma.user.findUnique.mockResolvedValue(mockUser());

      app = await buildApp();
      const res = await app.inject({
        method: 'POST',
        url: '/api/auth/login',
        payload: { email: 'admin@test.com', password: 'secret123' },
      });

      expect(res.statusCode).toBe(200);
      const body = res.json();
      expect(body.user.email).toBe('admin@test.com');
      expect(body.tokens.accessToken).toBeTruthy();
      expect(body.tokens.expiresIn).toBe(7 * 24 * 60 * 60);
    });

    it('returns 401 when user not found', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      app = await buildApp();
      const res = await app.inject({
        method: 'POST',
        url: '/api/auth/login',
        payload: { email: 'nobody@test.com', password: 'secret123' },
      });

      expect(res.statusCode).toBe(401);
      expect(res.json().error.code).toBe('AUTH_ERROR');
    });

    it('returns 401 when password does not match', async () => {
      vi.mocked(comparePassword).mockResolvedValue(false);
      mockPrisma.user.findUnique.mockResolvedValue(mockUser());

      app = await buildApp();
      const res = await app.inject({
        method: 'POST',
        url: '/api/auth/login',
        payload: { email: 'admin@test.com', password: 'wrong' },
      });

      expect(res.statusCode).toBe(401);
    });

    it('returns 400 on invalid email format', async () => {
      app = await buildApp();
      const res = await app.inject({
        method: 'POST',
        url: '/api/auth/login',
        payload: { email: 'not-an-email', password: '123' },
      });

      expect(res.statusCode).toBe(400);
      expect(res.json().error.code).toBe('VALIDATION_ERROR');
    });

    it('returns 400 when password is missing', async () => {
      app = await buildApp();
      const res = await app.inject({
        method: 'POST',
        url: '/api/auth/login',
        payload: { email: 'a@b.com' },
      });

      expect(res.statusCode).toBe(400);
    });
  });

  describe('GET /api/auth/me', () => {
    it('returns user profile with valid token', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockUser());

      app = await buildApp();
      const token = makeAuthToken();
      const res = await app.inject({
        method: 'GET',
        url: '/api/auth/me',
        headers: authHeader(token),
      });

      expect(res.statusCode).toBe(200);
      expect(res.json().user.email).toBe('admin@test.com');
    });

    it('returns 401 without token', async () => {
      app = await buildApp();
      const res = await app.inject({ method: 'GET', url: '/api/auth/me' });
      expect(res.statusCode).toBe(401);
    });

    it('returns 401 with invalid token', async () => {
      app = await buildApp();
      const res = await app.inject({
        method: 'GET',
        url: '/api/auth/me',
        headers: authHeader('invalid.jwt.token'),
      });
      expect(res.statusCode).toBe(401);
    });

    it('returns 401 when user no longer exists', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      app = await buildApp();
      const token = makeAuthToken();
      const res = await app.inject({
        method: 'GET',
        url: '/api/auth/me',
        headers: authHeader(token),
      });

      expect(res.statusCode).toBe(401);
    });
  });
});
