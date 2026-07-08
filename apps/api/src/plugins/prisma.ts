import { PrismaClient } from '@prisma/client';
import fp from 'fastify-plugin';

// ── Prisma client singleton ───────────────────────────────────────────────────

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

// ── Fastify plugin ────────────────────────────────────────────────────────────

export default fp(async (app) => {
  await prisma.$connect();
  app.decorate('prisma', prisma);

  app.addHook('onClose', async () => {
    await prisma.$disconnect();
  });
}, {
  name: 'prisma',
});

// ── Type augmentation ─────────────────────────────────────────────────────────

declare module 'fastify' {
  interface FastifyInstance {
    prisma: PrismaClient;
  }
}
