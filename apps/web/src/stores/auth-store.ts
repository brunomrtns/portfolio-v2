import { create } from 'zustand';
import { api } from '@/lib/api-client';
import type { User } from '@portfolio/types';

const SSO_LOGIN_URL = '/id/login?redirect=/portfolio/panel';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  init: () => Promise<void>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  isAuthenticated: false,

  init: async () => {
    try {
      const res = await api.auth.me();
      set({ user: res.user, isAuthenticated: true, isLoading: false });
    } catch {
      // Not authenticated — redirect to BI Identity login
      set({ user: null, isAuthenticated: false, isLoading: false });
      window.location.href = SSO_LOGIN_URL;
    }
  },

  logout: () => {
    set({ user: null, isAuthenticated: false });
    // Call the API logout endpoint, then redirect to BI Identity login
    void api.auth.logout().finally(() => {
      window.location.href = SSO_LOGIN_URL;
    });
  },
}));
