import { useAuthStore } from '@/store/authStore';
import { logout as logoutService } from '@/services/auth.service';
// no usa react query porque no es un query, es una action que afecta el estado global del usuario

export const useAuth = () => {
  //se ahce asi porque si algo cambia y se importo todo con deestructuring, se rerenderiza toda la app
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const clearUser = useAuthStore((state) => state.clearUser);

  const logout = async () => {
    await logoutService();
    clearUser();
  };

  return { user, isAuthenticated, logout };
};
