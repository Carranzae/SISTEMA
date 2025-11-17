import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { useAuth } from '@hooks/useAuth';
import { useBusinessStore } from '@store/business.store';

export default function RootLayout() {
  const auth = useAuth();
  const business = useBusinessStore((state) => state.business);

  useEffect(() => {
    // La autenticación se maneja automáticamente en useAuth
  }, []);

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animationEnabled: true,
      }}
    >
      {!auth.session ? (
        <>
          <Stack.Screen name="(auth)" />
        </>
      ) : !business ? (
        <>
          <Stack.Screen name="(onboarding)" />
        </>
      ) : (
        <>
          <Stack.Screen name="(app)" />
        </>
      )}
    </Stack>
  );
}
