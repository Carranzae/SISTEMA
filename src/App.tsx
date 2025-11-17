import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { supabase, supabaseConfig } from '@services/supabase/client';
import { useAuthStore } from '@store/auth.store';
import { colors } from '@theme/index';

export default function App() {
  const [isReady, setIsReady] = useState(false);
  const [configError, setConfigError] = useState<string | null>(null);
  const { setSession } = useAuthStore();

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      // Verificar configuración de Supabase
      if (!supabaseConfig.isConfigured) {
        setConfigError(
          'Supabase no está configurado. Verifica tu archivo .env'
        );
        return;
      }

      // Obtener sesión actual
      const { data, error } = await supabase.auth.getSession();

      if (error) {
        console.error('Error getting session:', error);
      }

      if (data?.session) {
        setSession(data.session);
      }

      setIsReady(true);
    } catch (error) {
      console.error('Error initializing app:', error);
      setConfigError('Error al inicializar la aplicación');
    }
  };

  if (configError) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: colors.white,
          paddingHorizontal: 20,
        }}
      >
        <Text
          style={{
            fontSize: 24,
            fontWeight: '700',
            color: colors.error,
            marginBottom: 10,
            textAlign: 'center',
          }}
        >
          ⚠️ Error de Configuración
        </Text>
        <Text
          style={{
            fontSize: 14,
            color: colors.gray[600],
            textAlign: 'center',
            marginBottom: 20,
          }}
        >
          {configError}
        </Text>
        <Text
          style={{
            fontSize: 12,
            color: colors.gray[500],
            textAlign: 'center',
          }}
        >
          Por favor, verifica tu archivo .env y vuelve a intentar.
        </Text>
      </View>
    );
  }

  if (!isReady) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: colors.white,
        }}
      >
        <ActivityIndicator size="large" color={colors.primary} />
        <Text
          style={{
            marginTop: 10,
            fontSize: 14,
            color: colors.gray[600],
          }}
        >
          Inicializando...
        </Text>
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <View style={{ flex: 1, backgroundColor: colors.white }}>
          <Text>✅ App inicializada correctamente</Text>
        </View>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
