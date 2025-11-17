import { useEffect } from 'react';
import { useAuthStore } from '@store/auth.store';
import { useBusinessStore } from '@store/business.store';
import { authService } from '@services/supabase/auth.service';

export const useAuth = () => {
  const authState = useAuthStore();
  const { fetchBusiness } = useBusinessStore();

  useEffect(() => {
    // Escuchar cambios de autenticación
    const unsubscribe = authService.onAuthStateChange(async (session) => {
      if (session?.user) {
        authState.setUser(session.user);
        authState.setSession(session);
        // Cargar negocio del usuario
        await fetchBusiness(session.user.id);
      } else {
        authState.setUser(null);
        authState.setSession(null);
      }
    });

    return () => unsubscribe?.subscription?.unsubscribe();
  }, []);

  return authState;
};
