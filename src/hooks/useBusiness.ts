import { useEffect } from 'react';
import { useBusinessStore } from '@store/business.store';
import { supabase } from '@services/supabase/client';

export const useBusiness = () => {
  const businessStore = useBusinessStore();

  useEffect(() => {
    loadBusiness();
  }, []);

  const loadBusiness = async () => {
    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        console.error('Error getting user:', userError);
        return;
      }

      // Obtener negocio del usuario
      const { data, error } = await supabase
        .from('negocios')
        .select('*')
        .eq('usuario_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching business:', error);
        return;
      }

      if (data) {
        businessStore.setBusiness(data);
      }
    } catch (error) {
      console.error('Unexpected error in loadBusiness:', error);
    }
  };

  return {
    business: businessStore.business,
    isLoading: businessStore.isLoading,
    error: businessStore.error,
    updateBusiness: businessStore.updateBusiness,
    fetchBusiness: businessStore.fetchBusiness,
  };
};
