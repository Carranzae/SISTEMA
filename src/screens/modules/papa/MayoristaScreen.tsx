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
import { formatCurrency } from '@utils/formatters';

interface CuentaPorCobrar {
  id: string;
  cliente: string;
  monto_total: number;
  monto_pagado: number;
  fecha_vencimiento: string;
  estado: 'PENDIENTE' | 'PAGADO' | 'VENCIDO';
}

export default function MayoristaScreen() {
  const { business } = useBusiness();
  const [cuentas, setCuentas] = useState<CuentaPorCobrar[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [totalDeuda, setTotalDeuda] = useState(0);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  useEffect(() => {
    loadCuentasPorCobrar();
  }, [business]);

  const loadCuentasPorCobrar = async () => {
    setIsLoading(true);
    // Simulación de datos
    const mockData: CuentaPorCobrar[] = [
      {
        id: '1',
        cliente: 'Bodega El Ahorro',
        monto_total: 1200,
        monto_pagado: 600,
        fecha_vencimiento: '2024-11-05',
        estado: 'VENCIDO',
      },
      {
        id: '2',
        cliente: 'Mercado Central',
        monto_total: 850,
        monto_pagado: 0,
        fecha_vencimiento: '2024-11-10',
        estado: 'PENDIENTE',
      },
    ];

    setCuentas(mockData);
    const total = mockData.reduce((sum, c) => sum + (c.monto_total - c.monto_pagado), 0);
    setTotalDeuda(total);
    setIsLoading(false);
  };

  if (isLoading) return <Loading fullScreen />;

  return (
    <View style={styles.container}>
      <Header
        title="🥔 Distribuidor - Mayorista"
        subtitle="Control de créditos"
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Deuda Total */}
        <Card style={styles.deudaCard}>
          <Text style={styles.deudaLabel}>Deuda Total</Text>
          <Text style={styles.deudaAmount}>
            {formatCurrency(totalDeuda, business?.moneda)}
          </Text>
          <Text style={styles.deudaClientes}>
            {cuentas.length} clientes
          </Text>
        </Card>

        {/* Cuentas por Cobrar */}
        <Card>
          <Text style={styles.sectionTitle}>📋 Cuentas por Cobrar</Text>

          {cuentas.map((cuenta) => (
            <View key={cuenta.id} style={styles.cuentaRow}>
              <View style={styles.cuentaInfo}>
                <Text style={styles.cuentaCliente}>{cuenta.cliente}</Text>
                <View style={styles.cuentaDetails}>
                  <Text style={styles.detailText}>
                    Total: {formatCurrency(cuenta.monto_total, business?.moneda)}
                  </Text>
                  <Text style={styles.detailText}>
                    Pagado: {formatCurrency(cuenta.monto_pagado, business?.moneda)}
                  </Text>
                </View>
                <Text style={[styles.estado, getEstadoStyle(cuenta.estado)]}>
                  {cuenta.estado}
                </Text>
              </View>

              <View style={styles.cuentaActions}>
                <Text style={styles.pendiente}>
                  {formatCurrency(
                    cuenta.monto_total - cuenta.monto_pagado,
                    business?.moneda
                  )}
                </Text>
                <TouchableOpacity>
                  <Text style={styles.actionButton}>📞</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </Card>

        {/* Proveedores */}
        <Card>
          <Text style={styles.sectionTitle}>🚚 Pedidos a Proveedores</Text>
          <Button
            label="+ Nuevo Pedido"
            onPress={() => Alert.alert('Nueva orden')}
            variant="secondary"
            fullWidth
          />
        </Card>
      </ScrollView>
    </View>
  );
}

const getEstadoStyle = (estado: string) => {
  switch (estado) {
    case 'PAGADO':
      return { color: colors.success };
    case 'VENCIDO':
      return { color: colors.error };
    default:
      return { color: colors.warning };
  }
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
  deudaCard: {
    backgroundColor: colors.primary + '15',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
    marginBottom: spacing.lg,
  },
  deudaLabel: {
    fontSize: 14,
    color: colors.gray[600],
    marginBottom: spacing.md,
  },
  deudaAmount: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: spacing.sm,
  },
  deudaClientes: {
    fontSize: 13,
    color: colors.gray[600],
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.black,
    marginBottom: spacing.md,
  },
  cuentaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  cuentaInfo: {
    flex: 1,
  },
  cuentaCliente: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.black,
    marginBottom: spacing.sm,
  },
  cuentaDetails: {
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  detailText: {
    fontSize: 12,
    color: colors.gray[600],
  },
  estado: {
    fontSize: 12,
    fontWeight: '600',
  },
  cuentaActions: {
    alignItems: 'flex-end',
    gap: spacing.md,
  },
  pendiente: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.error,
  },
  actionButton: {
    fontSize: 18,
  },
});
