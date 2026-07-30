import { vi, beforeEach } from 'vitest';

// Stable env for tests
process.env.BI_IDENTITY_URL = 'http://mock-identity:3300';
process.env.NODE_ENV = 'test';
process.env.CORS_ORIGIN = 'http://localhost:3103';

// Mock @prisma/client before any imports that use it
vi.mock('@prisma/client', () => {
  const mockPrisma = {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
    product: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    article: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      count: vi.fn(),
    },
    category: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    skill: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    experience: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    contactMessage: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    articleCategory: {
      deleteMany: vi.fn(),
      createMany: vi.fn(),
    },
    $connect: vi.fn(),
    $disconnect: vi.fn(),
  };

  return {
    PrismaClient: vi.fn(() => mockPrisma),
    __mockPrisma: mockPrisma,
  };
});

// Mock the translate service so tests don't hit Google Translate
vi.mock('../services/translate.js', () => ({
  SUPPORTED_LANGUAGES: ['en', 'es', 'fr', 'de', 'ja'],
  generateAllTranslations: vi.fn(async () => ({
    en: { _mock: 'en' },
    es: { _mock: 'es' },
  })),
  applyTranslations: vi.fn((record: Record<string, unknown>) => record),
  translateText: vi.fn(async (text: string) => text),
  translateFields: vi.fn(async (fields: Record<string, string>) => fields),
  translateArray: vi.fn(async (arr: string[]) => arr),
}));

beforeEach(() => {
  vi.clearAllMocks();
});
