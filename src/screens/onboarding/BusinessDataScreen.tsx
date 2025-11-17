import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';
import { Input, Button, Header, Card } from '@components/common';
import { colors, spacing } from '@theme/index';
import { DEPARTAMENTOS_PERU } from '@utils/constants';

interface BusinessDataScreenProps {
  onNext: (data: any) => void;
  onBack: () => void;
}

export const BusinessDataScreen: React.FC<BusinessDataScreenProps> = ({
  onNext,
  onBack,
}) => {
  const [data, setData] = useState({
    nombre_comercial: '',
    ruc: '',
    departamento: '',
    provincia: '',
    distrito: '',
    direccion_completa: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (field: string, value: string) => {
    setData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!data.nombre_comercial.trim()) {
      newErrors.nombre_comercial = 'Nombre requerido';
    }

    if (!data.departamento) {
      newErrors.departamento = 'Departamento requerido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validate()) {
      onNext(data);
    }
  };

  return (
    <View style={styles.container}>
      <Header
        title="📋 Tu Negocio"
        subtitle="Cuéntanos sobre tu negocio"
        onBackPress={onBack}
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Card>
          <Input
            label="Nombre Comercial *"
            placeholder="Ej: Bodega Don Pepe"
            value={data.nombre_comercial}
            onChangeText={(v) => handleChange('nombre_comercial', v)}
            error={errors.nombre_comercial}
          />

          <Input
            label="RUC (opcional)"
            placeholder="12345678901"
            value={data.ruc}
            onChangeText={(v) => handleChange('ruc', v)}
            keyboardType="numeric"
            maxLength={11}
          />

          <Input
            label="Departamento *"
            placeholder="Selecciona departamento"
            value={data.departamento}
            onChangeText={(v) => handleChange('departamento', v)}
            error={errors.departamento}
          />

          <Input
            label="Provincia"
            placeholder="Ej: Lima"
            value={data.provincia}
            onChangeText={(v) => handleChange('provincia', v)}
          />

          <Input
            label="Distrito"
            placeholder="Ej: Trujillo"
            value={data.distrito}
            onChangeText={(v) => handleChange('distrito', v)}
          />

          <Input
            label="Dirección Completa"
            placeholder="Ej: Jr. Principal 123"
            value={data.direccion_completa}
            onChangeText={(v) => handleChange('direccion_completa', v)}
            multiline
          />
        </Card>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          label="← Atrás"
          onPress={onBack}
          variant="ghost"
          fullWidth
          style={styles.backButton}
        />
        <Button
          label="Siguiente →"
          onPress={handleNext}
          fullWidth
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  content: {
    flex: 1,
    padding: spacing.lg,
  },
  footer: {
    padding: spacing.lg,
    gap: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.gray[200],
  },
  backButton: {
    marginBottom: spacing.md,
  },
});
