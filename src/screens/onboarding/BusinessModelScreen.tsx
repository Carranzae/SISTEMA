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

interface BusinessModelScreenProps {
  onNext: (modelo: string) => void;
  onBack: () => void;
}

interface ModelOption {
  value: string;
  title: string;
  emoji: string;
  description: string;
  example: string;
}

const MODELS: ModelOption[] = [
  {
    value: 'B2C',
    title: 'Al por MENOR (B2C)',
    emoji: '🏪',
    description: 'Vendes directo al consumidor final',
    example: 'Ej: Cliente entra a tu tienda y compra',
  },
  {
    value: 'B2B',
    title: 'Al por MAYOR (B2B)',
    emoji: '🚚',
    description: 'Vendes a otras empresas/revendedores',
    example: 'Ej: Vendes sacos de papa a bodegas',
  },
  {
    value: 'HIBRIDO',
    title: 'AMBOS (Híbrido)',
    emoji: '🔄',
    description: 'Tienes clientes finales Y mayoristas',
    example: 'Ej: Bodega que vende al público y mayoristas',
  },
];

export const BusinessModelScreen: React.FC<BusinessModelScreenProps> = ({
  onNext,
  onBack,
}) => {
  const [selectedModel, setSelectedModel] = useState<string | null>(null);

  return (
    <View style={styles.container}>
      <Header
        title="📊 Modelo de Negocio"
        subtitle="¿Cómo vendes principalmente?"
        onBackPress={onBack}
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {MODELS.map((model) => (
          <ModelCard
            key={model.value}
            model={model}
            selected={selectedModel === model.value}
            onPress={() => setSelectedModel(model.value)}
          />
        ))}
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
          onPress={() => selectedModel && onNext(selectedModel)}
          disabled={!selectedModel}
          fullWidth
        />
      </View>
    </View>
  );
};

interface ModelCardProps {
  model: ModelOption;
  selected: boolean;
  onPress: () => void;
}

const ModelCard: React.FC<ModelCardProps> = ({ model, selected, onPress }) => (
  <TouchableOpacity
    style={[styles.modelCard, selected && styles.modelCardSelected]}
    onPress={onPress}
  >
    <View style={styles.modelHeader}>
      <Text style={styles.emoji}>{model.emoji}</Text>
      <View style={styles.modelTitleContainer}>
        <Text style={styles.modelTitle}>{model.title}</Text>
        {selected && <Text style={styles.selectedBadge}>✓ Seleccionado</Text>}
      </View>
    </View>
    <Text style={styles.description}>{model.description}</Text>
    <Text style={styles.example}>{model.example}</Text>
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
  modelCard: {
    backgroundColor: colors.gray[50],
    borderRadius: 12,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  modelCardSelected: {
    backgroundColor: colors.primary + '15',
    borderColor: colors.primary,
  },
  modelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  emoji: {
    fontSize: 32,
    marginRight: spacing.md,
  },
  modelTitleContainer: {
    flex: 1,
  },
  modelTitle: {
    ...typography.h4,
    color: colors.black,
    marginBottom: spacing.sm,
  },
  selectedBadge: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '700',
  },
  description: {
    ...typography.body,
    color: colors.gray[700],
    marginBottom: spacing.sm,
  },
  example: {
    ...typography.bodySm,
    color: colors.gray[600],
    fontStyle: 'italic',
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
