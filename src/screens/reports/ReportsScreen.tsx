import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
} from 'react-native';
import { Header, Card, Loading } from '@components/common';
import { colors, spacing, typography } from '@theme/index';
import { useSales, useBusiness } from '@hooks/index';
import { formatCurrency, formatDate } from '@utils/formatters';

export default function ReportsScreen() {
  const { getSummary, ventas, isLoading, loadSalesHistory } = useSales();
  const { business } = useBusiness();
  
  const [period, setPeriod] = useState<'today' | 'week' | 'month'>('month');
  const [summary, setSummary] = useState<any>(null);

  useEffect(() => {
    const loadReports = async () => {
      if (!business) return;
      
      let days = 1;
      if (period === 'week') days = 7;
      if (period === 'month') days = 30;

      try {
        const data = await getSummary(days);
        setSummary(data);
        await loadSalesHistory({
          startDate: new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString(),
          endDate: new Date().toISOString(),
        });
      } catch (error) {
        console.error('Error loading reports:', error);
      }
    };

    loadReports();
  }, [period, business]);

  if (isLoading) return <Loading fullScreen />;

  return (
    <View style={styles.container}>
      <Header
        title="📈 Reportes"
        subtitle="Análisis de tu negocio"
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Selector de Período */}
        <View style={styles.periodSelector}>
          {['today', 'week', 'month'].map((p) => (
            <TouchableOpacity
              key={p}
              style={[
                styles.periodButton,
                period === p && styles.periodButtonActive,
              ]}
              onPress={() => setPeriod(p as any)}
            >
              <Text
                style={[
                  styles.periodText,
                  period === p && styles.periodTextActive,
                ]}
              >
                {p === 'today'
                  ? 'Hoy'
                  : p === 'week'
                  ? 'Esta Semana'
                  : 'Este Mes'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Resumen General */}
        {summary && (
          <>
            <Card>
              <Text style={styles.sectionTitle}>📊 Resumen General</Text>
              
              <View style={styles.statsGrid}>
                <StatBox
                  label="Total Ventas"
                  value={formatCurrency(summary.total, business?.moneda)}
                  emoji="💰"
                />
                <StatBox
                  label="Número de Ventas"
                  value={summary.cantidad?.toString()}
                  emoji="🛒"
                />
                <StatBox
                  label="Promedio Diario"
                  value={formatCurrency(summary.promedioDiario, business?.moneda)}
                  emoji="📅"
                />
              </View>
            </Card>

            {/* Ventas Recientes */}
            <Card>
              <Text style={styles.sectionTitle}>📋 Últimas Ventas</Text>

              {ventas.length === 0 ? (
                <Text style={styles.emptyText}>No hay ventas en este período</Text>
              ) : (
                ventas.slice(0, 5).map((venta) => (
                  <View
                    key={venta.id}
                    style={styles.ventaItem}
                  >
                    <View style={styles.ventaInfo}>
                      <Text style={styles.ventaItems}>
                        {venta.items.length} producto(s)
                      </Text>
                      <Text style={styles.ventaDate}>
                        {formatDate(venta.created_at)}
                      </Text>
                    </View>
                    <Text style={styles.ventaTotal}>
                      {formatCurrency(venta.total, business?.moneda)}
                    </Text>
                  </View>
                ))
              )}
            </Card>

            {/* Métodos de Pago */}
            <Card>
              <Text style={styles.sectionTitle}>💳 Por Método de Pago</Text>

              {(() => {
                const byMethod: Record<string, number> = {};
                ventas.forEach((v) => {
                  byMethod[v.metodo_pago] =
                    (byMethod[v.metodo_pago] || 0) + v.total;
                });

                return Object.entries(byMethod).map(([method, total]) => (
                  <View key={method} style={styles.methodRow}>
                    <Text style={styles.methodLabel}>{method}</Text>
                    <Text style={styles.methodValue}>
                      {formatCurrency(total, business?.moneda)}
                    </Text>
                  </View>
                ));
              })()}
            </Card>

            {/* Productos Más Vendidos */}
            <Card>
              <Text style={styles.sectionTitle}>⭐ Productos Top</Text>

              {(() => {
                const productSales: Record<string, number> = {};
                ventas.forEach((v) => {
                  v.items.forEach((item) => {
                    productSales[item.producto_id] =
                      (productSales[item.producto_id] || 0) + item.cantidad;
                  });
                });

                const sorted = Object.entries(productSales)
                  .sort(([, a], [, b]) => b - a)
                  .slice(0, 5);

                return sorted.length > 0 ? (
                  sorted.map(([productId, qty]) => (
                    <View key={productId} style={styles.topProductRow}>
                      <Text style={styles.topProductLabel}>Producto</Text>
                      <Text style={styles.topProductValue}>{qty} unid.</Text>
                    </View>
                  ))
                ) : (
                  <Text style={styles.emptyText}>Sin datos</Text>
                );
              })()}
            </Card>
          </>
        )}
      </ScrollView>
    </View>
  );
}

interface StatBoxProps {
  label: string;
  value: string;
  emoji: string;
}

const StatBox: React.FC<StatBoxProps> = ({ label, value, emoji }) => (
  <View style={styles.statBox}>
    <Text style={styles.statEmoji}>{emoji}</Text>
    <Text style={styles.statBoxLabel}>{label}</Text>
    <Text style={styles.statBoxValue}>{value}</Text>
  </View>
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
  periodSelector: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  periodButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: 8,
    backgroundColor: colors.gray[100],
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  periodButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  periodText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.gray[700],
  },
  periodTextActive: {
    color: colors.white,
  },
  sectionTitle: {
    ...typography.h4,
    marginBottom: spacing.lg,
    color: colors.black,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  statBox: {
    flex: 1,
    backgroundColor: colors.gray[50],
    borderRadius: 8,
    padding: spacing.md,
    alignItems: 'center',
  },
  statEmoji: {
    fontSize: 28,
    marginBottom: spacing.sm,
  },
  statBoxLabel: {
    fontSize: 12,
    color: colors.gray[600],
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  statBoxValue: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
    textAlign: 'center',
  },
  emptyText: {
    textAlign: 'center',
    color: colors.gray[600],
    paddingVertical: spacing.lg,
  },
  ventaItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  ventaInfo: {
    flex: 1,
  },
  ventaItems: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.black,
    marginBottom: spacing.sm,
  },
  ventaDate: {
    fontSize: 12,
    color: colors.gray[600],
  },
  ventaTotal: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
  },
  methodRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  methodLabel: {
    fontSize: 14,
    color: colors.black,
  },
  methodValue: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
  },
  topProductRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  topProductLabel: {
    fontSize: 14,
    color: colors.black,
  },
  topProductValue: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.success,
  },
});
