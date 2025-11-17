import React from 'react';
import { DashboardScreen } from '@screens/dashboard';
import { useRouter } from 'expo-router';

export default function HomePage() {
  const router = useRouter();

  const handleNavigate = (screen: string) => {
    router.push(`/${screen}` as any);
  };

  return <DashboardScreen onNavigate={handleNavigate} />;
}
