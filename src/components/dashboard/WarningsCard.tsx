import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Card } from '@components/common';
import { colors, spacing } from '@theme/index';

interface Warning {
  id: string;
  type: 'expiring' | 'overdue' | 'low-stock';
  title: string;
  description: string;
  emoji: string;
}

interface WarningsCardProps {
  warnings: Warning[];
}

export const WarningsCard: React.FC<WarningsCardProps> = ({ warnings }) => {
  if (warnings.length === 0) {
    return (
      <Card>
        <Text style={styles.noWarnings}>✅ Todo está en orden</Text>
      </Card>
    );
  }

  return (
    <Card>
      <Text style={styles.title}>⚠️ Alertas</Text>
      <ScrollView style={styles.warningsList}>
        {warnings.map((warning) => (
          <View key={warning.id} style={styles.warningItem}>
            <Text style={styles.emoji}>{warning.emoji}</Text>
            <View style={styles.warningContent}>
              <Text style={styles.warningTitle}>{warning.title}</Text>
              <Text style={styles.warningDescription}>
                {warning.description}
              </Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </Card>
  );
};

const styles = StyleSheet.create({
  title: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: spacing.md,
    color: colors.black,
  },
  warningsList: {
    maxHeight: 200,
  },
  warningItem: {
    flexDirection: 'row',
    marginBottom: spacing.md,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  emoji: {
    fontSize: 20,
    marginRight: spacing.md,
  },
  warningContent: {
    flex: 1,
  },
  warningTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.black,
    marginBottom: 2,
  },
  warningDescription: {
    fontSize: 12,
    color: colors.gray[600],
  },
  noWarnings: {
    fontSize: 14,
    color: colors.success,
    fontWeight: '600',
    textAlign: 'center',
    paddingVertical: spacing.md,
  },
});
