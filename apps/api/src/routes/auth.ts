import type { FastifyInstance, FastifyPluginAsync } from 'fastify';
import type { MeResponse, User } from '@portfolio/types';
import { requireAuth, type BiUser } from '../plugins/auth.js';

// ── Auth routes (BI Identity SSO) ─────────────────────────────────────────────

const SSO_LOGIN_REDIRECT = '/id/login?redirect=/portfolio/panel';

const authRoutes: FastifyPluginAsync = async (app: FastifyInstance) => {
  // ── GET /auth/sso-redirect ──────────────────────────────────────────────────
  // Redirects the browser to the BI Identity login page.
  app.get('/sso-redirect', async (_request, reply) => {
    return reply.redirect(SSO_LOGIN_REDIRECT, 302);
  });

  // ── GET /auth/logout ────────────────────────────────────────────────────────
  // Clears local state and redirects to BI Identity login.
  app.get('/logout', async (_request, reply) => {
    return reply.redirect(SSO_LOGIN_REDIRECT, 302);
  });

  // ── GET /auth/me (requireAuth) ──────────────────────────────────────────────
  // Returns the authenticated BI Identity user.
  app.get('/me', { preHandler: [requireAuth] }, async (request, reply): Promise<MeResponse> => {
    const biUser = request.userPayload as BiUser;

    const userResponse: User = {
      id: biUser.id,
      email: biUser.email,
      role: 'ADMIN' as User['role'],
      createdAt: new Date().toISOString(),
    };

    return reply.send({ user: userResponse });
  });
};

export default authRoutes;
