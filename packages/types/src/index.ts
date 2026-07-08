// ── Enums ─────────────────────────────────────────────────────────────────────

export enum UserRole {
  ADMIN = 'ADMIN',
}

export enum ArticleStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
}

export enum ProductStatus {
  ACTIVE = 'ACTIVE',
  COMING_SOON = 'COMING_SOON',
  ARCHIVED = 'ARCHIVED',
}

// ── User ──────────────────────────────────────────────────────────────────────

export interface User {
  id: string;
  email: string;
  role: UserRole;
  createdAt: string;
}

// ── Product ───────────────────────────────────────────────────────────────────

export interface Product {
  id: string;
  name: string;
  tagline: string;
  description: string;
  longDescription: string | null;
  slug: string;
  url: string;
  repoUrl: string | null;
  imageUrl: string | null;
  logoUrl: string | null;
  tech: string[];
  features: string[];
  status: ProductStatus;
  featured: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProductListItem {
  id: string;
  name: string;
  tagline: string;
  description: string;
  slug: string;
  url: string;
  imageUrl: string | null;
  logoUrl: string | null;
  tech: string[];
  status: ProductStatus;
  featured: boolean;
}

// ── Article ───────────────────────────────────────────────────────────────────

export interface Category {
  id: string;
  name: string;
  slug: string;
  color: string;
  articleCount?: number;
}

export interface ArticleListItem {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  coverUrl: string | null;
  status: ArticleStatus;
  publishedAt: string | null;
  createdAt: string;
  categories: Category[];
}

export interface Article extends ArticleListItem {
  content: string;
  updatedAt: string;
}

// ── Skill ─────────────────────────────────────────────────────────────────────

export interface Skill {
  id: string;
  name: string;
  category: string;
  icon: string | null;
  order: number;
}

// ── Experience ─────────────────────────────────────────────────────────────────

export interface Experience {
  id: string;
  role: string;
  company: string;
  location: string | null;
  startDate: string;
  endDate: string | null;
  current: boolean;
  description: string | null;
  achievements: string[];
  order: number;
}

// ── Contact ───────────────────────────────────────────────────────────────────

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  message: string;
  read: boolean;
  createdAt: string;
}

// ── Auth ──────────────────────────────────────────────────────────────────────

export interface AuthTokens {
  accessToken: string;
  expiresIn: number;
}

export interface LoginResponse {
  user: User;
  tokens: AuthTokens;
}

export interface MeResponse {
  user: User;
}
