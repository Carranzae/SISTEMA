import { useState, useEffect } from 'react';
import { useAuthStore } from '@store/auth.store';
import { usersAdvancedService } from '@services/supabase/users-advanced.service';

export const usePermissions = (modulo: string, accion: string) => {
  const { user } = useAuthStore();
  const [hasPermission, setHasPermission] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkPermission();
  }, [user, modulo, accion]);

  const checkPermission = async () => {
    if (!user) {
      setHasPermission(false);
      setIsLoading(false);
      return;
    }

    try {
      const permission = await usersAdvancedService.hasPermission(
        user.id,
        modulo,
        accion
      );
      setHasPermission(permission);
    } catch (error) {
      console.error('Error checking permission:', error);
      setHasPermission(false);
    } finally {
      setIsLoading(false);
    }
  };

  return { hasPermission, isLoading };
};
