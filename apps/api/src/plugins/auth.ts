import fp from 'fastify-plugin';
import { AuthError } from '@portfolio/shared';
import { verifyToken, type JwtPayload } from '../utils/jwt.js';

// ── Auth plugin ───────────────────────────────────────────────────────────────
//
// Reads Bearer token from Authorization header, verifies with JWT_SECRET env,
// and sets request.userId.
//
// Export `requireAuth` for route-level auth via preHandler.

export const JWT_SECRET = process.env.JWT_SECRET ?? 'dev-secret-change-me';

export interface AuthenticatedRequest {
  userId: string;
  userPayload: JwtPayload;
}

/**
 * PreHandler hook that requires a valid JWT Bearer token.
 * Use on routes that need authentication.
 */
export async function requireAuth(request: import('fastify').FastifyRequest): Promise<void> {
  const authHeader = request.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new AuthError('Missing or invalid Authorization header');
  }

  const token = authHeader.slice('Bearer '.length).trim();

  let payload: JwtPayload;
  try {
    payload = verifyToken(token, JWT_SECRET);
  } catch {
    throw new AuthError('Invalid or expired token');
  }

  request.userId = payload.userId;
  request.userPayload = payload;
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
    userPayload?: JwtPayload;
  }
}
