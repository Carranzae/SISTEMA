import { create } from 'zustand';
import { supabase } from '@services/supabase/client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Database } from '@services/supabase/client';

interface Business {
  id: string;
  nombre_comercial: string;
  ruc: string;
  rubro: string;
  modelo_negocio: string;
  plan_actual: string;
  moneda: string;
  // ...existing code...
}

interface BusinessStoreState {
  business: Business | null;
  isLoading: boolean;
  error: string | null;
  setBusiness: (business: Business | null) => void;
  fetchBusiness: (businessId: string) => Promise<void>;
  updateBusiness: (updates: Partial<Business>) => Promise<void>;
  clearBusiness: () => void;
}

export const useBusinessStore = create<BusinessStoreState>((set) => ({
  business: null,
  isLoading: false,
  error: null,

  setBusiness: (business) => set({ business }),

  fetchBusiness: async (businessId: string) => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('negocios')
        .select('*')
        .eq('id', businessId)
        .single();

      if (error) throw error;

      set({ business: data as Business, isLoading: false });

      // Cachear en AsyncStorage
      await AsyncStorage.setItem('business_data', JSON.stringify(data));
    } catch (error: any) {
      set({
        error: error.message || 'Error loading business',
        isLoading: false,
      });
    }
  },

  updateBusiness: async (updates: Partial<Business>) => {
    if (!get().business) return;

    set({ isLoading: true });
    try {
      const { data, error } = await supabase
        .from('negocios')
        .update(updates)
        .eq('id', get().business!.id)
        .select()
        .single();

      if (error) throw error;

      set({ business: data as Business, isLoading: false });

      await AsyncStorage.setItem('business_data', JSON.stringify(data));
    } catch (error: any) {
      set({
        error: error.message || 'Error updating business',
        isLoading: false,
      });
    }
  },

  clearBusiness: () => {
    set({ business: null, error: null });
    AsyncStorage.removeItem('business_data');
  },
}));

// Función auxiliar para obtener del store
function get() {
  return useBusinessStore.getState();
}
