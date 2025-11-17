import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Text,
  Alert,
} from 'react-native';
import { Header, Button, Modal, Input, Card, Loading } from '@components/common';
import { colors, spacing, typography } from '@theme/index';
import { useBusiness } from '@hooks/useBusiness';
import { supabase } from '@services/supabase/client';
import { formatDate } from '@utils/formatters';

interface AbarrotesProduct {
  id: string;
  nombre: string;
  codigo_barras: string;
  precio_venta: number;
  stock: number;
  fecha_vencimiento: string;
  lote: string;
}

export default function AbarrotesInventoryScreen() {
  const { business } = useBusiness();
  const [products, setProducts] = useState<AbarrotesProduct[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [alertas, setAlertas] = useState({
    vencidos: 0,
    proximos: 0,
    stockBajo: 0,
  });

  useEffect(() => {
    loadAbarrotesData();
  }, [business]);

  const loadAbarrotesData = async () => {
    if (!business) return;
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('productos')
        .select('*')
        .eq('negocio_id', business.id);

      if (error) throw error;

      const today = new Date();
      let vencidos = 0;
      let proximos = 0;
      let stockBajo = 0;

      const processed = (data || []).map((p) => {
        const fechaVenc = new Date(p.atributos?.fecha_vencimiento);
        const diasDiff = Math.floor(
          (fechaVenc.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
        );

        if (diasDiff < 0) vencidos++;
        if (diasDiff >= 0 && diasDiff <= 7) proximos++;
        if (p.stock_actual < p.stock_minimo) stockBajo++;

        return p;
      });

      setProducts(processed);
      setAlertas({ vencidos, proximos, stockBajo });
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) return <Loading fullScreen />;

  return (
    <View style={styles.container}>
      <Header
        title="🛒 Abarrotes - Inventario"
        subtitle="Control de vencimientos"
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Alertas */}
        <View style={styles.alertsGrid}>
          <AlertCard
            emoji="⚠️"
            label="Vencidos"
            count={alertas.vencidos}
            color={colors.error}
          />
          <AlertCard
            emoji="⏰"
            label="Por Vencer"
            count={alertas.proximos}
            color={colors.warning}
          />
          <AlertCard
            emoji="📉"
            label="Stock Bajo"
            count={alertas.stockBajo}
            color={colors.info}
          />
        </View>

        {/* Productos por Vencer */}
        <Card>
          <Text style={styles.sectionTitle}>⏰ Por Vencer (7 días)</Text>
          {products
            .filter((p) => {
              const fecha = new Date(p.fecha_vencimiento);
              const hoy = new Date();
              const dias = (fecha.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24);
              return dias >= 0 && dias <= 7;
            })
            .map((p) => (
              <View key={p.id} style={styles.productRow}>
                <View style={styles.productInfo}>
                  <Text style={styles.productName}>{p.nombre}</Text>
                  <Text style={styles.productDetails}>
                    Vence: {formatDate(p.fecha_vencimiento)} | Lote: {p.lote}
                  </Text>
                </View>
                <Text style={styles.stock}>{p.stock} unid.</Text>
              </View>
            ))}
        </Card>

        {/* Productos Vencidos */}
        <Card>
          <Text style={styles.sectionTitle}>🚨 Vencidos</Text>
          {products
            .filter((p) => {
              const fecha = new Date(p.fecha_vencimiento);
              return fecha < new Date();
            })
            .map((p) => (
              <View key={p.id} style={[styles.productRow, styles.expiredRow]}>
                <View style={styles.productInfo}>
                  <Text style={styles.productNameExpired}>{p.nombre}</Text>
                  <Text style={styles.productDetails}>
                    Vencido: {formatDate(p.fecha_vencimiento)}
                  </Text>
                </View>
                <Button
                  label="Eliminar"
                  onPress={() => Alert.alert('Eliminar producto vencido')}
                  size="sm"
                  variant="danger"
                />
              </View>
            ))}
        </Card>
      </ScrollView>
    </View>
  );
}

interface AlertCardProps {
  emoji: string;
  label: string;
  count: number;
  color: string;
}

const AlertCard: React.FC<AlertCardProps> = ({ emoji, label, count, color }) => (
  <View style={[styles.alertCard, { borderLeftColor: color }]}>
    <Text style={styles.alertEmoji}>{emoji}</Text>
    <Text style={styles.alertLabel}>{label}</Text>
    <Text style={[styles.alertCount, { color }]}>{count}</Text>
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
  alertsGrid: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  alertCard: {
    flex: 1,
    backgroundColor: colors.gray[50],
    borderRadius: 12,
    padding: spacing.md,
    borderLeftWidth: 4,
    alignItems: 'center',
  },
  alertEmoji: {
    fontSize: 24,
    marginBottom: spacing.sm,
  },
  alertLabel: {
    fontSize: 12,
    color: colors.gray[600],
    marginBottom: spacing.sm,
  },
  alertCount: {
    fontSize: 20,
    fontWeight: '700',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.black,
    marginBottom: spacing.md,
  },
  productRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  expiredRow: {
    backgroundColor: colors.error + '05',
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.black,
    marginBottom: spacing.sm,
  },
  productNameExpired: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.error,
    marginBottom: spacing.sm,
  },
  productDetails: {
    fontSize: 12,
    color: colors.gray[600],
  },
  stock: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
  },
});
