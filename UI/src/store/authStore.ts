import { create } from 'zustand';
import { env } from '@/lib/env';
import type { AuthState, User } from '@/types';

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,

  setUser: (user: User) => set({ user, isAuthenticated: true }),

  clearUser: () => set({ user: null, isAuthenticated: false }),

  initFromServer: async () => {
    try {
      const res = await fetch(`${env.apiUrl}/auth/me`, {
        credentials: 'include',
      });
      if (res.ok) {
        const { user } = await res.json();
        set({ user, isAuthenticated: true });
      }
    } catch {
      // sesión inválida o servidor no disponible — no hacer nada
    }
  },
}));
