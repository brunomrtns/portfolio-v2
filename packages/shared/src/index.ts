import { z } from 'zod';
import bcrypt from 'bcryptjs';

// ── ID generator (CUID-style, short) ──────────────────────────────────────────

export function generateId(): string {
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`;
}

// ── Password hashing ──────────────────────────────────────────────────────────

const BCRYPT_ROUNDS = 12;

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, BCRYPT_ROUNDS);
}

export async function comparePassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

// ── Slugify ───────────────────────────────────────────────────────────────────

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

// ── Error classes ─────────────────────────────────────────────────────────────

export class AppError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly code: string,
    message: string,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class AuthError extends AppError {
  constructor(message: string) {
    super(401, 'AUTH_ERROR', message);
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string, id: string) {
    super(404, 'NOT_FOUND', `${resource} not found: ${id}`);
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(409, 'CONFLICT', message);
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: unknown) {
    super(400, 'VALIDATION_ERROR', message, details);
  }
}

// ── Validation schemas ────────────────────────────────────────────────────────

export const loginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(1, 'Password required'),
});

export const createArticleSchema = z.object({
  title: z.string().min(1).max(200),
  slug: z.string().min(1).max(200).optional(),
  excerpt: z.string().min(1).max(500),
  content: z.string().min(1),
  coverUrl: z.string().url().nullable().optional(),
  status: z.enum(['DRAFT', 'PUBLISHED']).default('DRAFT'),
  publishedAt: z.string().datetime().nullable().optional(),
  categoryIds: z.array(z.string()).optional(),
});

export const updateArticleSchema = createArticleSchema.partial();

export const createCategorySchema = z.object({
  name: z.string().min(1).max(100),
  slug: z.string().min(1).max(100).optional(),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/).default('#71717a'),
});

export const updateCategorySchema = createCategorySchema.partial();

export const createProductSchema = z.object({
  name: z.string().min(1).max(100),
  tagline: z.string().min(1).max(200),
  description: z.string().min(1).max(500),
  longDescription: z.string().nullable().optional(),
  slug: z.string().min(1).max(100).optional(),
  url: z.string().url(),
  repoUrl: z.string().url().nullable().optional(),
  imageUrl: z.string().url().nullable().optional(),
  logoUrl: z.string().url().nullable().optional(),
  tech: z.array(z.string()).default([]),
  features: z.array(z.string()).default([]),
  status: z.enum(['ACTIVE', 'COMING_SOON', 'ARCHIVED']).default('ACTIVE'),
  featured: z.boolean().default(false),
  order: z.number().int().default(0),
});

export const updateProductSchema = createProductSchema.partial();

export const createSkillSchema = z.object({
  name: z.string().min(1).max(100),
  category: z.string().min(1).max(100),
  icon: z.string().nullable().optional(),
  order: z.number().int().default(0),
});

export const updateSkillSchema = createSkillSchema.partial();

export const createExperienceSchema = z.object({
  role: z.string().min(1).max(100),
  company: z.string().min(1).max(100),
  location: z.string().nullable().optional(),
  startDate: z.string().datetime(),
  endDate: z.string().datetime().nullable().optional(),
  current: z.boolean().default(false),
  description: z.string().nullable().optional(),
  achievements: z.array(z.string()).default([]),
  order: z.number().int().default(0),
});

export const updateExperienceSchema = createExperienceSchema.partial();

export const contactSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  message: z.string().min(1).max(5000),
});
