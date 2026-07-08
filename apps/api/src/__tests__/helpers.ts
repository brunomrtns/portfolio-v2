import { vi } from 'vitest';
import Fastify from 'fastify';
import cors from '@fastify/cors';
import cookie from '@fastify/cookie';
import { signToken } from '../utils/jwt.js';

// Re-import the mocked prisma client to access the mock instance
const prismaModule = (await import('@prisma/client')) as unknown as {
  __mockPrisma: Record<string, Record<string, ReturnType<typeof vi.fn>>>;
};
export const mockPrisma = prismaModule.__mockPrisma;

export async function buildApp() {
  const app = Fastify({ logger: false });

  await app.register(cors, {
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  });
  await app.register(cookie);

  // Import plugins after mock is set up
  const { default: prismaPlugin } = await import('../plugins/prisma.js');
  const { default: errorHandlerPlugin } = await import('../plugins/error-handler.js');
  const { default: authPlugin } = await import('../plugins/auth.js');
  const { default: langPlugin } = await import('../plugins/lang.js');
  const { default: publicRoutes } = await import('../routes/public.js');
  const { default: authRoutes } = await import('../routes/auth.js');
  const { default: adminRoutes } = await import('../routes/admin.js');

  await app.register(prismaPlugin);
  await app.register(errorHandlerPlugin);
  await app.register(authPlugin);
  await app.register(langPlugin);

  await app.register(publicRoutes, { prefix: '/api' });
  await app.register(authRoutes, { prefix: '/api/auth' });
  await app.register(adminRoutes, { prefix: '/api/admin' });

  return app;
}

export function makeAuthToken(userId = 'user-1', email = 'admin@test.com'): string {
  return signToken({ userId, email, role: 'ADMIN' }, process.env.JWT_SECRET!);
}

export function authHeader(token: string): Record<string, string> {
  return { authorization: `Bearer ${token}` };
}

// Factory helpers for mock data
export function mockUser(overrides: Record<string, unknown> = {}) {
  return {
    id: 'user-1',
    email: 'admin@test.com',
    passwordHash: '$2a$12$mockhash',
    role: 'ADMIN',
    createdAt: new Date('2024-01-01'),
    ...overrides,
  };
}

export function mockProduct(overrides: Record<string, unknown> = {}) {
  return {
    id: 'prod-1',
    name: 'Trivestia',
    tagline: 'Plataforma financeira',
    description: 'Plataforma completa',
    longDescription: null,
    slug: 'trivestia',
    url: 'https://trivestia.com',
    repoUrl: null,
    imageUrl: null,
    logoUrl: null,
    tech: ['React', 'Node.js'],
    features: ['Feature 1'],
    status: 'ACTIVE',
    featured: true,
    order: 0,
    translations: { en: { tagline: 'Financial platform' } },
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    ...overrides,
  };
}

export function mockArticle(overrides: Record<string, unknown> = {}) {
  return {
    id: 'art-1',
    title: 'Hello World',
    slug: 'hello-world',
    excerpt: 'Short summary',
    content: 'Body text',
    coverUrl: null,
    status: 'PUBLISHED',
    publishedAt: new Date('2024-06-01'),
    translations: { en: { title: 'Hello World' } },
    createdAt: new Date('2024-06-01'),
    updatedAt: new Date('2024-06-01'),
    categories: [],
    ...overrides,
  };
}

export function mockCategory(overrides: Record<string, unknown> = {}) {
  return {
    id: 'cat-1',
    name: 'Engenharia',
    slug: 'engenharia',
    color: '#2dd4bf',
    translations: { en: { name: 'Engineering' } },
    createdAt: new Date('2024-01-01'),
    _count: { articles: 3 },
    ...overrides,
  };
}

export function mockSkill(overrides: Record<string, unknown> = {}) {
  return {
    id: 'skill-1',
    name: 'React',
    category: 'Frontend',
    icon: null,
    order: 0,
    translations: { en: { name: 'React' } },
    createdAt: new Date('2024-01-01'),
    ...overrides,
  };
}

export function mockExperience(overrides: Record<string, unknown> = {}) {
  return {
    id: 'exp-1',
    role: 'Developer',
    company: 'Acme',
    location: 'Florianópolis',
    startDate: new Date('2023-01-01'),
    endDate: null,
    current: true,
    description: 'Building stuff',
    achievements: ['Did X', 'Did Y'],
    order: 0,
    translations: {},
    createdAt: new Date('2024-01-01'),
    ...overrides,
  };
}

export function mockMessage(overrides: Record<string, unknown> = {}) {
  return {
    id: 'msg-1',
    name: 'John',
    email: 'john@test.com',
    message: 'Hello there',
    read: false,
    createdAt: new Date('2024-06-01'),
    ...overrides,
  };
}
