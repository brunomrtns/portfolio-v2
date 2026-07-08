import { create } from 'zustand';
import { api, setAccessToken, getAccessToken } from '@/lib/api-client';
import type { User } from '@portfolio/types';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  init: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  isAuthenticated: false,

  init: async () => {
    const token = getAccessToken();
    if (!token) {
      set({ isLoading: false });
      return;
    }
    try {
      const res = await api.auth.me();
      set({ user: res.user, isAuthenticated: true, isLoading: false });
    } catch {
      setAccessToken(null);
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },

  login: async (email, password) => {
    const res = await api.auth.login(email, password);
    setAccessToken(res.tokens.accessToken);
    set({ user: res.user, isAuthenticated: true });
  },

  logout: () => {
    setAccessToken(null);
    set({ user: null, isAuthenticated: false });
  },
}));
