import fp from 'fastify-plugin';
import { AuthError } from '@portfolio/shared';

// ── Auth plugin (BI Identity SSO) ─────────────────────────────────────────────
//
// Reads the `bi_auth` cookie from the request, forwards it to the BI Identity
// Service's /api/auth/check endpoint for validation, and sets request.userId
// and request.userPayload with the BI user object.
//
// Export `requireAuth` for route-level auth via preHandler.

export const BI_IDENTITY_URL = process.env.BI_IDENTITY_URL ?? 'http://bi-api:3300';

// ── BI Identity user object ───────────────────────────────────────────────────

export interface BiUser {
  id: string;
  email: string;
  name: string;
  status: string;
  isSuperAdmin: boolean;
  roles: string[];
  organizations: unknown[];
}

export interface AuthenticatedRequest {
  userId: string;
  userPayload: BiUser;
}

/**
 * PreHandler hook that requires a valid BI Identity SSO cookie.
 * Use on routes that need authentication.
 */
export async function requireAuth(request: import('fastify').FastifyRequest): Promise<void> {
  const cookie = request.cookies.bi_auth;

  if (!cookie) {
    throw new AuthError('Missing bi_auth cookie');
  }

  let user: BiUser;
  try {
    const res = await fetch(`${BI_IDENTITY_URL}/api/auth/check`, {
      headers: { cookie: `bi_auth=${cookie}` },
    });

    if (res.status === 401) {
      throw new AuthError('Invalid or expired session');
    }

    if (!res.ok) {
      throw new AuthError(`Identity service returned ${res.status}`);
    }

    user = (await res.json()) as BiUser;
  } catch (err) {
    if (err instanceof AuthError) throw err;
    throw new AuthError('Failed to validate session');
  }

  request.userId = user.id;
  request.userPayload = user;
}

// ── Fastify plugin (registers nothing globally, just ensures module loads) ───

export default fp(async (app) => {
  app.decorate('requireAuth', requireAuth);
}, {
  name: 'auth',
});

// ── Type augmentation ─────────────────────────────────────────────────────────

declare module 'fastify' {
  interface FastifyInstance {
    requireAuth: typeof requireAuth;
  }

  interface FastifyRequest {
    userId?: string;
    userPayload?: BiUser;
  }
}
