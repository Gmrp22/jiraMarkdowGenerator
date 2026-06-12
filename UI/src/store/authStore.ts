import { create } from 'zustand';
import { env } from '@/lib/env';
import type { AuthState, User } from '@/types';

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,

  setUser: (user: User) => set({ user, isAuthenticated: true }),

  clearUser: () => set({ user: null, isAuthenticated: false }),

  // La cookie HttpOnly es invisible para JS. Este método le pregunta al servidor quién
  // es el usuario para hidratar Zustand — necesario en cada carga de página (ej. F5).
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
