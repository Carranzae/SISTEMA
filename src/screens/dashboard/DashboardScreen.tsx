import React, { useEffect, useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Text,
} from 'react-native';
import { Header, Loading } from '@components/common';
import { SalesCard, WarningsCard } from '@components/dashboard';
import { colors, spacing, typography } from '@theme/index';
import { useBusiness, useSales } from '@hooks/index';

interface DashboardScreenProps {
  onNavigate?: (screen: string) => void;
}

export default function DashboardScreen({ onNavigate }: DashboardScreenProps) {
  const { business, isLoading, getRubroConfig } = useBusiness();
  const { getSummary } = useSales();
  const [summary, setSummary] = useState<any>(null);
  const [warnings, setWarnings] = useState<any[]>([]);

  useEffect(() => {
    const loadData = async () => {
      if (!business) return;
      try {
        const salesSummary = await getSummary(1);
        setSummary(salesSummary);
      } catch (error) {
        console.error('Error loading dashboard:', error);
      }
    };

    loadData();
  }, [business]);

  if (isLoading) return <Loading fullScreen />;

  if (!business) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>Negocio no encontrado</Text>
      </View>
    );
  }

  const rubroConfig = getRubroConfig(business.rubro);

  const quickActions = [
    { emoji: '🛍️', label: 'Nueva Venta', screen: 'pos' },
    { emoji: '📦', label: 'Inventario', screen: 'inventory' },
    { emoji: '💰', label: 'Caja', screen: 'cash' },
    { emoji: '📈', label: 'Reportes', screen: 'reports' },
  ];

  return (
    <View style={styles.container}>
      <Header
        title={`📊 ${business.nombre_comercial}`}
        subtitle={`${rubroConfig?.emoji} ${rubroConfig?.nombre}`}
      />

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {summary && (
          <SalesCard
            totalSales={summary.total || 0}
            currency={business.moneda}
          />
        )}

        <WarningsCard warnings={warnings} />

        <View style={styles.menuGrid}>
          {quickActions.map((action) => (
            <MenuButton
              key={action.screen}
              emoji={action.emoji}
              label={action.label}
              onPress={() => onNavigate?.(action.screen)}
            />
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

interface MenuButtonProps {
  emoji: string;
  label: string;
  onPress: () => void;
}

const MenuButton: React.FC<MenuButtonProps> = ({ emoji, label, onPress }) => (
  <TouchableOpacity style={styles.menuButton} onPress={onPress}>
    <Text style={styles.menuEmoji}>{emoji}</Text>
    <Text style={styles.menuLabel}>{label}</Text>
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
  menuGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  menuButton: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: colors.gray[50],
    borderRadius: 12,
    padding: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.gray[200],
  },
  menuEmoji: {
    fontSize: 32,
    marginBottom: spacing.sm,
  },
  menuLabel: {
    ...typography.bodySm,
    color: colors.black,
    textAlign: 'center',
    fontWeight: '600',
  },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.white,
  },
  emptyText: {
    ...typography.body,
    color: colors.gray[600],
  },
});
