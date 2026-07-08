import type { FastifyInstance, FastifyPluginAsync } from 'fastify';
import { loginSchema, AuthError, comparePassword } from '@portfolio/shared';
import type { LoginResponse, MeResponse, User } from '@portfolio/types';
import { signToken, type JwtPayload } from '../utils/jwt.js';
import { requireAuth, JWT_SECRET } from '../plugins/auth.js';

// ── Auth routes ───────────────────────────────────────────────────────────────

const authRoutes: FastifyPluginAsync = async (app: FastifyInstance) => {
  // ── POST /auth/login ────────────────────────────────────────────────────────
  app.post('/login', async (request, reply): Promise<LoginResponse> => {
    const { email, password } = loginSchema.parse(request.body);

    const user = await app.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new AuthError('Invalid email or password');
    }

    const valid = await comparePassword(password, user.passwordHash);
    if (!valid) {
      throw new AuthError('Invalid email or password');
    }

    const payload: JwtPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = signToken(payload, JWT_SECRET);

    const userResponse: User = {
      id: user.id,
      email: user.email,
      role: user.role as User['role'],
      createdAt: user.createdAt.toISOString(),
    };

    return reply.send({
      user: userResponse,
      tokens: {
        accessToken,
        expiresIn: 7 * 24 * 60 * 60, // 7 days in seconds
      },
    });
  });

  // ── GET /auth/me (requireAuth) ──────────────────────────────────────────────
  app.get('/me', { preHandler: [requireAuth] }, async (request, reply): Promise<MeResponse> => {
    const userId = request.userId!;

    const user = await app.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new AuthError('User not found');
    }

    const userResponse: User = {
      id: user.id,
      email: user.email,
      role: user.role as User['role'],
      createdAt: user.createdAt.toISOString(),
    };

    return reply.send({ user: userResponse });
  });
};

export default authRoutes;
