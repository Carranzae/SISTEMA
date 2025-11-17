import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Text,
} from 'react-native';
import { Button, Header, Card } from '@components/common';
import { colors, spacing, typography } from '@theme/index';
import { RUBROS } from '@utils/constants';
import type { Rubro } from '@types/business';

interface BusinessTypeScreenProps {
  onNext: (rubro: string) => void;
  onBack: () => void;
}

export const BusinessTypeScreen: React.FC<BusinessTypeScreenProps> = ({
  onNext,
  onBack,
}) => {
  const [selectedRubro, setSelectedRubro] = useState<string | null>(null);

  const handleNext = () => {
    if (selectedRubro) {
      onNext(selectedRubro);
    }
  };

  const rubros = Object.entries(RUBROS);

  return (
    <View style={styles.container}>
      <Header
        title="🎯 Tu Rubro"
        subtitle="¿Cuál es el tipo de negocio?"
        onBackPress={onBack}
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>Selecciona el que mejor describe:</Text>

        <View style={styles.rubrosList}>
          {rubros.map(([key, rubro]) => (
            <RubroOption
              key={key}
              rubroKey={key}
              rubro={rubro}
              selected={selectedRubro === key}
              onPress={() => setSelectedRubro(key)}
            />
          ))}
        </View>
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
          disabled={!selectedRubro}
          fullWidth
        />
      </View>
    </View>
  );
};

interface RubroOptionProps {
  rubroKey: string;
  rubro: any;
  selected: boolean;
  onPress: () => void;
}

const RubroOption: React.FC<RubroOptionProps> = ({
  rubroKey,
  rubro,
  selected,
  onPress,
}) => (
  <TouchableOpacity
    style={[styles.rubroCard, selected && styles.rubroCardSelected]}
    onPress={onPress}
  >
    <Text style={styles.rubroEmoji}>{rubro.emoji}</Text>
    <Text style={styles.rubroName}>{rubro.nombre}</Text>
    {selected && <Text style={styles.checkmark}>✓</Text>}
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  content: {
    flex: 1,
    padding: spacing.lg,
  },
  sectionTitle: {
    ...typography.body,
    color: colors.gray[700],
    marginBottom: spacing.lg,
    fontWeight: '600',
  },
  rubrosList: {
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  rubroCard: {
    backgroundColor: colors.gray[50],
    borderRadius: 12,
    padding: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  rubroCardSelected: {
    backgroundColor: colors.primary + '15',
    borderColor: colors.primary,
  },
  rubroEmoji: {
    fontSize: 28,
    marginRight: spacing.md,
  },
  rubroName: {
    ...typography.body,
    color: colors.black,
    fontWeight: '600',
    flex: 1,
  },
  checkmark: {
    fontSize: 20,
    color: colors.primary,
    fontWeight: '700',
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
