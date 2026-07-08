import { describe, it, expect, beforeEach, vi } from 'vitest';
import { UserRole } from '@portfolio/types';
import { useAuthStore } from './auth-store';
import { setAccessToken } from '@/lib/api-client';

// Mock the api-client module
vi.mock('@/lib/api-client', () => ({
  api: {
    auth: {
      me: vi.fn(),
      login: vi.fn(),
    },
  },
  setAccessToken: vi.fn(),
  getAccessToken: vi.fn(() => null),
}));

describe('auth store', () => {
  beforeEach(() => {
    useAuthStore.setState({ user: null, isLoading: true, isAuthenticated: false });
    vi.clearAllMocks();
  });

  it('starts with null user and loading=true', () => {
    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.isLoading).toBe(true);
    expect(state.isAuthenticated).toBe(false);
  });

  it('init sets loading=false when no token', async () => {
    const { getAccessToken } = await import('@/lib/api-client');
    vi.mocked(getAccessToken).mockReturnValue(null);

    await useAuthStore.getState().init();

    const state = useAuthStore.getState();
    expect(state.isLoading).toBe(false);
    expect(state.isAuthenticated).toBe(false);
  });

  it('init fetches user when token exists', async () => {
    const { api, getAccessToken } = await import('@/lib/api-client');
    vi.mocked(getAccessToken).mockReturnValue('fake-token');
    vi.mocked(api.auth.me).mockResolvedValue({
      user: { id: '1', email: 'test@test.com', role: UserRole.ADMIN, createdAt: '2024-01-01' },
    });

    await useAuthStore.getState().init();

    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(true);
    expect(state.user?.email).toBe('test@test.com');
    expect(state.isLoading).toBe(false);
  });

  it('init clears token on api failure', async () => {
    const { api, getAccessToken, setAccessToken } = await import('@/lib/api-client');
    vi.mocked(getAccessToken).mockReturnValue('expired-token');
    vi.mocked(api.auth.me).mockRejectedValue(new Error('401'));

    await useAuthStore.getState().init();

    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(false);
    expect(state.user).toBeNull();
    expect(setAccessToken).toHaveBeenCalledWith(null);
  });

  it('login stores token and user', async () => {
    const { api, setAccessToken } = await import('@/lib/api-client');
    vi.mocked(api.auth.login).mockResolvedValue({
      user: { id: '1', email: 'admin@test.com', role: UserRole.ADMIN, createdAt: '2024-01-01' },
      tokens: { accessToken: 'jwt-token', expiresIn: 604800 },
    });

    await useAuthStore.getState().login('admin@test.com', 'pass');

    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(true);
    expect(state.user?.email).toBe('admin@test.com');
    expect(setAccessToken).toHaveBeenCalledWith('jwt-token');
  });

  it('logout clears state and token', async () => {
    const { setAccessToken } = await import('@/lib/api-client');

    useAuthStore.setState({
      user: { id: '1', email: 'a@b.com', role: UserRole.ADMIN, createdAt: '2024' },
      isAuthenticated: true,
      isLoading: false,
    });

    useAuthStore.getState().logout();

    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(false);
    expect(state.user).toBeNull();
    expect(setAccessToken).toHaveBeenCalledWith(null);
  });
});
