import React, { useState } from 'react';
import { View } from 'react-native';
import { WelcomeScreen, AuthScreen } from '@screens/onboarding';

type AuthStep = 'welcome' | 'auth';

export default function AuthPage() {
  const [step, setStep] = useState<AuthStep>('welcome');

  return (
    <View style={{ flex: 1 }}>
      {step === 'welcome' ? (
        <WelcomeScreen onStart={() => setStep('auth')} />
      ) : (
        <AuthScreen onSuccess={() => {}} isLogin={false} />
      )}
    </View>
  );
}
