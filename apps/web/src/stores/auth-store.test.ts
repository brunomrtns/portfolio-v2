import { describe, it, expect, beforeEach, vi } from 'vitest';
import { UserRole } from '@portfolio/types';
import { useAuthStore } from './auth-store';

// Mock the api-client module
vi.mock('@/lib/api-client', () => ({
  api: {
    auth: {
      me: vi.fn(),
      logout: vi.fn(),
    },
  },
}));

// Mock window.location
const mockLocation = {
  href: '',
  pathname: '/portfolio/panel',
};
Object.defineProperty(window, 'location', {
  value: mockLocation,
  writable: true,
});

describe('auth store', () => {
  beforeEach(() => {
    useAuthStore.setState({ user: null, isLoading: true, isAuthenticated: false });
    vi.clearAllMocks();
    mockLocation.href = '';
  });

  it('starts with null user and loading=true', () => {
    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.isLoading).toBe(true);
    expect(state.isAuthenticated).toBe(false);
  });

  it('init sets user when /api/auth/me succeeds', async () => {
    const { api } = await import('@/lib/api-client');
    vi.mocked(api.auth.me).mockResolvedValue({
      user: { id: '1', email: 'test@test.com', role: UserRole.ADMIN, createdAt: '2024-01-01' },
    });

    await useAuthStore.getState().init();

    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(true);
    expect(state.user?.email).toBe('test@test.com');
    expect(state.isLoading).toBe(false);
  });

  it('init redirects to SSO login on api failure', async () => {
    const { api } = await import('@/lib/api-client');
    vi.mocked(api.auth.me).mockRejectedValue(new Error('401'));

    await useAuthStore.getState().init();

    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(false);
    expect(state.user).toBeNull();
    expect(state.isLoading).toBe(false);
    expect(mockLocation.href).toContain('/id/login');
  });

  it('logout calls api and redirects to SSO login', async () => {
    const { api } = await import('@/lib/api-client');
    vi.mocked(api.auth.logout).mockResolvedValue(undefined);

    useAuthStore.setState({
      user: { id: '1', email: 'a@b.com', role: UserRole.ADMIN, createdAt: '2024' },
      isAuthenticated: true,
      isLoading: false,
    });

    useAuthStore.getState().logout();

    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(false);
    expect(state.user).toBeNull();
    // The redirect happens in a .finally() callback
    await new Promise((resolve) => setTimeout(resolve, 10));
    expect(mockLocation.href).toContain('/id/login');
  });
});
