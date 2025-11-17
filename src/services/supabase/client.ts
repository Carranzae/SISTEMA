import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
const projectId = process.env.EXPO_PUBLIC_SUPABASE_PROJECT_ID;

if (!supabaseUrl || !supabaseAnonKey || !projectId) {
  console.error('Supabase configuration missing:');
  console.error('URL:', supabaseUrl ? '✓' : '✗');
  console.error('ANON_KEY:', supabaseAnonKey ? '✓' : '✗');
  console.error('PROJECT_ID:', projectId ? '✓' : '✗');
  throw new Error(
    'Supabase configuration is missing. Check your .env file.'
  );
}

// Usar AsyncStorage para almacenamiento en React Native
const supabaseStorageAdapter = {
  getItem: async (key: string) => {
    try {
      const value = await AsyncStorage.getItem(key);
      return value;
    } catch (error) {
      console.error('Error getting item from AsyncStorage:', error);
      return null;
    }
  },
  setItem: async (key: string, value: string) => {
    try {
      await AsyncStorage.setItem(key, value);
    } catch (error) {
      console.error('Error setting item in AsyncStorage:', error);
    }
  },
  removeItem: async (key: string) => {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error('Error removing item from AsyncStorage:', error);
    }
  },
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: supabaseStorageAdapter as any,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
  global: {
    headers: {
      'Content-Type': 'application/json',
      'X-Client-Info': `omnitienda-bpm/${process.env.EXPO_PUBLIC_API_VERSION}`,
    },
  },
});

// Exportar información de configuración
export const supabaseConfig = {
  url: supabaseUrl,
  projectId,
  isConfigured: !!(supabaseUrl && supabaseAnonKey),
};

// Inicializar sesión al cargar
supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'INITIAL_SESSION') {
    console.log('✓ Sesión inicial cargada');
  } else if (event === 'SIGNED_IN') {
    console.log('✓ Usuario autenticado');
  } else if (event === 'SIGNED_OUT') {
    console.log('✓ Usuario desautenticado');
  }
});

// Tipos de base de datos
export type Database = {
  public: {
    Tables: {
      usuarios: {
        Row: {
          id: string;
          email: string;
          nombre: string;
          rol: string;
          negocio_id: string;
          activo: boolean;
          created_at: string;
        };
      };
      negocios: {
        Row: {
          id: string;
          nombre_comercial: string;
          ruc: string;
          rubro: string;
          plan_actual: string;
          created_at: string;
        };
      };
      productos: {
        Row: {
          id: string;
          nombre: string;
          codigo: string;
          precio_venta: number;
          stock_actual: number;
          stock_minimo: number;
          negocio_id: string;
          created_at: string;
        };
      };
    };
  };
};
