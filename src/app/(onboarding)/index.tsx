import React, { useState } from 'react';
import { View, SafeAreaView } from 'react-native';
import {
  BusinessDataScreen,
  BusinessTypeScreen,
  BusinessModelScreen,
} from '@screens/onboarding';
import { useBusiness } from '@hooks/useBusiness';
import { useAuthStore } from '@store/auth.store';

type OnboardingStep = 'data' | 'type' | 'model';

interface OnboardingData {
  nombre_comercial: string;
  ruc?: string;
  departamento?: string;
  provincia?: string;
  distrito?: string;
  direccion_completa?: string;
  rubro?: string;
  modelo_negocio?: string;
}

export default function OnboardingPage() {
  const [step, setStep] = useState<OnboardingStep>('data');
  const [data, setData] = useState<OnboardingData>({
    nombre_comercial: '',
  });

  const { user } = useAuthStore();
  const { createBusiness } = useBusiness();

  const handleBusinessData = (newData: any) => {
    setData((prev) => ({ ...prev, ...newData }));
    setStep('type');
  };

  const handleBusinessType = (rubro: string) => {
    setData((prev) => ({ ...prev, rubro }));
    setStep('model');
  };

  const handleBusinessModel = async (modelo_negocio: string) => {
    const finalData = { ...data, modelo_negocio };
    if (user) {
      await createBusiness(finalData, user.id);
    }
  };

  const handleBack = () => {
    if (step === 'type') setStep('data');
    else if (step === 'model') setStep('type');
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      {step === 'data' && (
        <BusinessDataScreen onNext={handleBusinessData} onBack={() => {}} />
      )}
      {step === 'type' && (
        <BusinessTypeScreen onNext={handleBusinessType} onBack={handleBack} />
      )}
      {step === 'model' && (
        <BusinessModelScreen
          onNext={handleBusinessModel}
          onBack={handleBack}
        />
      )}
    </SafeAreaView>
  );
}
