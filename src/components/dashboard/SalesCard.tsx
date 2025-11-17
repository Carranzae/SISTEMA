import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card } from '@components/common';
import { colors, spacing, typography } from '@theme/index';

interface SalesCardProps {
  totalSales: number;
  dailyTarget?: number;
  currency?: string;
}

export const SalesCard: React.FC<SalesCardProps> = ({
  totalSales,
  dailyTarget = 0,
  currency = 'S/',
}) => {
  const percentage = dailyTarget > 0 ? (totalSales / dailyTarget) * 100 : 0;

  return (
    <Card>
      <View style={styles.header}>
        <Text style={styles.label}>Ventas de Hoy</Text>
        <Text style={styles.percentage}>{Math.round(percentage)}%</Text>
      </View>

      <Text style={styles.amount}>
        {currency} {totalSales.toLocaleString('es-PE')}
      </Text>

      {dailyTarget > 0 && (
        <View style={styles.progressContainer}>
          <View
            style={[
              styles.progressBar,
              { width: `${Math.min(percentage, 100)}%` },
            ]}
          />
        </View>
      )}

      {dailyTarget > 0 && (
        <Text style={styles.target}>
          Meta: {currency} {dailyTarget.toLocaleString('es-PE')}
        </Text>
      )}
    </Card>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  label: {
    fontSize: 14,
    color: colors.gray[600],
    fontWeight: '500',
  },
  percentage: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary,
  },
  amount: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.black,
    marginBottom: spacing.md,
  },
  progressContainer: {
    height: 8,
    backgroundColor: colors.gray[200],
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: spacing.md,
  },
  progressBar: {
    height: '100%',
    backgroundColor: colors.success,
  },
  target: {
    fontSize: 12,
    color: colors.gray[600],
  },
});
