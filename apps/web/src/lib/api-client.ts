import type {
  Product,
  ProductListItem,
  Article,
  ArticleListItem,
  Category,
  Skill,
  Experience,
  LoginResponse,
  MeResponse,
} from '@portfolio/types';
import i18n from '@/i18n/i18n';

// ── Config ────────────────────────────────────────────────────────────────────

const API_BASE = import.meta.env.VITE_API_URL ?? '/portfolio/api';

// ── Current language helper ───────────────────────────────────────────────────

function getCurrentLang(): string {
  return i18n.language ?? 'pt-BR';
}

// ── Token management ──────────────────────────────────────────────────────────

let accessToken: string | null = null;

export function setAccessToken(token: string | null): void {
  accessToken = token;
  if (token) {
    localStorage.setItem('portfolio_access_token', token);
  } else {
    localStorage.removeItem('portfolio_access_token');
  }
}

export function getAccessToken(): string | null {
  if (!accessToken) {
    accessToken = localStorage.getItem('portfolio_access_token');
  }
  return accessToken;
}

// Initialize from localStorage on module load
getAccessToken();

// ── Error class ───────────────────────────────────────────────────────────────

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly body: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// ── Request helper ────────────────────────────────────────────────────────────

interface RequestOptions {
  method?: string;
  body?: unknown;
  params?: Record<string, string | number | undefined>;
  auth?: boolean;
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, params, auth = false } = options;

  const url = new URL(`${API_BASE}${path}`, window.location.origin);
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined) url.searchParams.set(key, String(value));
    }
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Accept-Language': getCurrentLang(),
  };

  if (auth) {
    const token = getAccessToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(url.toString(), {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    let errorBody: unknown = null;
    try {
      errorBody = await res.json();
    } catch {
      // ignore
    }
    let message = res.statusText || `Request failed (${res.status})`;
    if (
      errorBody !== null &&
      typeof errorBody === 'object' &&
      'error' in errorBody
    ) {
      const errorObj = (errorBody as Record<string, unknown>).error;
      if (errorObj !== null && typeof errorObj === 'object' && 'message' in errorObj) {
        const msg = (errorObj as Record<string, unknown>).message;
        if (typeof msg === 'string' && msg.length > 0) {
          message = msg;
        }
      }
    }
    throw new ApiError(res.status, message, errorBody);
  }

  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

// ── API ───────────────────────────────────────────────────────────────────────

export const api = {
  // Public
  products: {
    list: (): Promise<ProductListItem[]> => request('/products'),
    get: (slug: string): Promise<Product> => request(`/products/${slug}`),
  },
  articles: {
    list: (params?: { page?: number; limit?: number; categoryId?: string }): Promise<{
      items: ArticleListItem[];
      total: number;
      page: number;
      limit: number;
    }> => request('/articles', { params }),
    get: (slug: string): Promise<Article> => request(`/articles/${slug}`),
  },
  categories: {
    list: (): Promise<Category[]> => request('/categories'),
  },
  skills: {
    list: (): Promise<Skill[]> => request('/skills'),
  },
  experience: {
    list: (): Promise<Experience[]> => request('/experience'),
  },
  contact: {
    send: (data: { name: string; email: string; message: string }): Promise<void> =>
      request('/contact', { method: 'POST', body: data }),
  },

  // Auth
  auth: {
    login: (email: string, password: string): Promise<LoginResponse> =>
      request('/auth/login', { method: 'POST', body: { email, password } }),
    me: (): Promise<MeResponse> => request('/auth/me', { auth: true }),
  },

  // Admin — Products
  admin: {
    products: {
      list: (): Promise<Product[]> => request('/admin/products', { auth: true }),
      create: (data: Partial<Product>): Promise<Product> =>
        request('/admin/products', { method: 'POST', body: data, auth: true }),
      update: (id: string, data: Partial<Product>): Promise<Product> =>
        request(`/admin/products/${id}`, { method: 'PUT', body: data, auth: true }),
      delete: (id: string): Promise<void> =>
        request(`/admin/products/${id}`, { method: 'DELETE', auth: true }),
    },
    articles: {
      list: (): Promise<Article[]> => request('/admin/articles', { auth: true }),
      create: (data: Record<string, unknown>): Promise<Article> =>
        request('/admin/articles', { method: 'POST', body: data, auth: true }),
      update: (id: string, data: Record<string, unknown>): Promise<Article> =>
        request(`/admin/articles/${id}`, { method: 'PUT', body: data, auth: true }),
      delete: (id: string): Promise<void> =>
        request(`/admin/articles/${id}`, { method: 'DELETE', auth: true }),
    },
    categories: {
      list: (): Promise<Category[]> => request('/admin/categories', { auth: true }),
      create: (data: { name: string; color?: string }): Promise<Category> =>
        request('/admin/categories', { method: 'POST', body: data, auth: true }),
      update: (id: string, data: Partial<Category>): Promise<Category> =>
        request(`/admin/categories/${id}`, { method: 'PUT', body: data, auth: true }),
      delete: (id: string): Promise<void> =>
        request(`/admin/categories/${id}`, { method: 'DELETE', auth: true }),
    },
    messages: {
      list: (): Promise<import('@portfolio/types').ContactMessage[]> =>
        request('/admin/messages', { auth: true }),
      markRead: (id: string): Promise<void> =>
        request(`/admin/messages/${id}/read`, { method: 'PUT', auth: true }),
    },
  },
};
