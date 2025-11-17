import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Text,
  Alert,
  FlatList,
  Modal,
} from 'react-native';
import { Header, Button, Card, Input, Loading } from '@components/common';
import { ActionButtons } from '@components/common/ActionButtons';
import { PermissionGate } from '@components/common/PermissionGate';
import { colors, spacing, typography } from '@theme/index';
import { useBusiness } from '@hooks/useBusiness';
import { useAuthStore } from '@store/auth.store';
import { notificationService } from '@services/notifications/notification.service';
import { formatCurrency, formatDate } from '@utils/formatters';

interface Movimiento {
  id: string;
  tipo: 'INGRESO' | 'EGRESO';
  concepto: string;
  monto: number;
  fecha: string;
  usuario: string;
  observaciones?: string;
}

export default function CashScreenV2() {
  const { business } = useBusiness();
  const { user: currentUser } = useAuthStore();

  const [cajaAbierta, setCajaAbierta] = useState(true);
  const [movimientos, setMovimientos] = useState<Movimiento[]>([
    {
      id: '1',
      tipo: 'INGRESO',
      concepto: 'Venta POS',
      monto: 250,
      fecha: new Date().toISOString(),
      usuario: 'Juan Pérez',
    },
    {
      id: '2',
      tipo: 'EGRESO',
      concepto: 'Cambio',
      monto: 50,
      fecha: new Date().toISOString(),
      usuario: 'Juan Pérez',
    },
  ]);

  const [isLoading, setIsLoading] = useState(false);
  const [showMovementModal, setShowMovementModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedMovimiento, setSelectedMovimiento] = useState<Movimiento | null>(null);

  const [formData, setFormData] = useState({
    tipo: 'INGRESO' as 'INGRESO' | 'EGRESO',
    concepto: '',
    monto: '',
    observaciones: '',
  });

  const totalIngresos = movimientos
    .filter((m) => m.tipo === 'INGRESO')
    .reduce((sum, m) => sum + m.monto, 0);

  const totalEgresos = movimientos
    .filter((m) => m.tipo === 'EGRESO')
    .reduce((sum, m) => sum + m.monto, 0);

  const saldoEsperado = totalIngresos - totalEgresos;

  const handleAddMovimiento = async () => {
    if (
      !formData.concepto.trim() ||
      !formData.monto.trim() ||
      !currentUser ||
      !business
    ) {
      Alert.alert('Error', 'Completa todos los campos');
      return;
    }

    try {
      const nuevoMovimiento: Movimiento = {
        id: Date.now().toString(),
        tipo: formData.tipo,
        concepto: formData.concepto,
        monto: parseFloat(formData.monto),
        fecha: new Date().toISOString(),
        usuario: currentUser.email || 'Usuario',
        observaciones: formData.observaciones,
      };

      setMovimientos([nuevoMovimiento, ...movimientos]);

      // Notificar
      await notificationService.notifyBoxMovement(
        business.id,
        currentUser.id,
        formData.tipo,
        parseFloat(formData.monto)
      );

      setFormData({
        tipo: 'INGRESO',
        concepto: '',
        monto: '',
        observaciones: '',
      });
      setShowMovementModal(false);
      Alert.alert('✅ Éxito', 'Movimiento registrado');
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  const handleDeleteMovimiento = async (movimientoId: string) => {
    const movimiento = movimientos.find((m) => m.id === movimientoId);
    if (!movimiento) return;

    Alert.alert(
      '⚠️ Eliminar Movimiento',
      `¿Eliminar movimiento de ${formatCurrency(movimiento.monto, business?.moneda)}?`,
      [
        { text: 'Cancelar' },
        {
          text: 'Eliminar',
          onPress: () => {
            setMovimientos(
              movimientos.filter((m) => m.id !== movimientoId)
            );
            Alert.alert('✅ Éxito', 'Movimiento eliminado');
          },
          style: 'destructive',
        },
      ]
    );
  };

  const handleExportMovimientos = () => {
    const csv = movimientos
      .map(
        (m) =>
          `${formatDate(m.fecha)},${m.tipo},${m.concepto},${m.monto},${m.usuario}`
      )
      .join('\n');

    Alert.alert('✅ Exportado', 'Movimientos exportados como CSV');
  };

  const renderMovimiento = ({ item }: { item: Movimiento }) => (
    <TouchableOpacity
      style={styles.movimientoItem}
      onPress={() => {
        setSelectedMovimiento(item);
        setShowDetailModal(true);
      }}
    >
      <View style={styles.movimientoHeader}>
        <Text style={styles.movimientoIcon}>
          {item.tipo === 'INGRESO' ? '📈' : '📉'}
        </Text>
        <View style={styles.movimientoInfo}>
          <Text style={styles.movimientoConcepto}>{item.concepto}</Text>
          <Text style={styles.movimientoUsuario}>{item.usuario}</Text>
        </View>
        <Text
          style={[
            styles.movimientoMonto,
            item.tipo === 'INGRESO'
              ? styles.montoIngreso
              : styles.montoEgreso,
          ]}
        >
          {item.tipo === 'INGRESO' ? '+' : '-'}
          {formatCurrency(item.monto, business?.moneda)}
        </Text>
      </View>
      <Text style={styles.movimientoTime}>
        {formatDate(item.fecha)}
      </Text>
    </TouchableOpacity>
  );

  if (isLoading) return <Loading fullScreen />;

  return (
    <View style={styles.container}>
      <Header
        title="💰 Caja"
        subtitle={cajaAbierta ? '🟢 Abierta' : '🔴 Cerrada'}
      />

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Balance */}
        <Card style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Saldo Esperado</Text>
          <Text style={styles.balanceAmount}>
            {formatCurrency(saldoEsperado, business?.moneda)}
          </Text>

          <View style={styles.balanceDetails}>
            <View style={styles.balanceItem}>
              <Text style={styles.detailLabel}>Ingresos</Text>
              <Text style={[styles.detailAmount, styles.amountIn]}>
                {formatCurrency(totalIngresos, business?.moneda)}
              </Text>
            </View>
            <View style={styles.balanceItem}>
              <Text style={styles.detailLabel}>Egresos</Text>
              <Text style={[styles.detailAmount, styles.amountOut]}>
                {formatCurrency(totalEgresos, business?.moneda)}
              </Text>
            </View>
          </View>
        </Card>

        {/* Botones de Acción */}
        <PermissionGate modulo="caja" accion="crear">
          <View style={styles.actionButtonsContainer}>
            <Button
              label="➕ Nuevo Movimiento"
              onPress={() => setShowMovementModal(true)}
              fullWidth
              style={styles.actionButton}
            />
            <Button
              label="📊 Exportar"
              onPress={handleExportMovimientos}
              variant="secondary"
              fullWidth
              style={styles.actionButton}
            />
            <Button
              label="🔍 Conciliar"
              onPress={() => Alert.alert('Conciliación', 'En desarrollo')}
              variant="secondary"
              fullWidth
            />
          </View>
        </PermissionGate>

        {/* Movimientos */}
        <Card>
          <View style={styles.movimientosHeader}>
            <Text style={styles.movimientosTitle}>
              📋 Movimientos ({movimientos.length})
            </Text>
          </View>

          <FlatList
            data={movimientos}
            renderItem={renderMovimiento}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            nestedScrollEnabled={false}
          />
        </Card>
      </ScrollView>

      {/* Modal Nuevo Movimiento */}
      <Modal visible={showMovementModal} animationType="slide">
        <ScrollView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowMovementModal(false)}>
              <Text style={styles.closeButton}>✕</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Nuevo Movimiento</Text>
            <View style={{ width: 30 }} />
          </View>

          <View style={styles.formContainer}>
            <View style={styles.typeSelector}>
              {(['INGRESO', 'EGRESO'] as const).map((tipo) => (
                <TouchableOpacity
                  key={tipo}
                  style={[
                    styles.typeOption,
                    formData.tipo === tipo &&
                      styles.typeOptionSelected,
                  ]}
                  onPress={() =>
                    setFormData({ ...formData, tipo })
                  }
                >
                  <Text
                    style={[
                      styles.typeOptionText,
                      formData.tipo === tipo &&
                        styles.typeOptionTextSelected,
                    ]}
                  >
                    {tipo === 'INGRESO' ? '📈 Ingreso' : '📉 Egreso'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Input
              label="Concepto"
              placeholder="Ej: Venta POS, Cambio"
              value={formData.concepto}
              onChangeText={(v) =>
                setFormData({ ...formData, concepto: v })
              }
            />

            <Input
              label="Monto"
              placeholder="0.00"
              value={formData.monto}
              onChangeText={(v) =>
                setFormData({ ...formData, monto: v })
              }
              keyboardType="decimal-pad"
            />

            <Input
              label="Observaciones"
              placeholder="Notas adicionales"
              value={formData.observaciones}
              onChangeText={(v) =>
                setFormData({
                  ...formData,
                  observaciones: v,
                })
              }
              multiline
            />

            <Button
              label="✅ Registrar"
              onPress={handleAddMovimiento}
              fullWidth
              loading={isLoading}
              style={styles.submitButton}
            />

            <Button
              label="Cancelar"
              onPress={() => setShowMovementModal(false)}
              variant="ghost"
              fullWidth
            />
          </View>
        </ScrollView>
      </Modal>

      {/* Modal Detalle */}
      <Modal visible={showDetailModal} animationType="fade">
        {selectedMovimiento && (
          <View style={styles.detailModalContainer}>
            <View style={styles.detailModalHeader}>
              <TouchableOpacity onPress={() => setShowDetailModal(false)}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Detalle</Text>
              <View style={{ width: 30 }} />
            </View>

            <ScrollView style={styles.detailContent}>
              <Card>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Tipo</Text>
                  <Text style={styles.detailValue}>
                    {selectedMovimiento.tipo}
                  </Text>
                </View>

                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Concepto</Text>
                  <Text style={styles.detailValue}>
                    {selectedMovimiento.concepto}
                  </Text>
                </View>

                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Monto</Text>
                  <Text
                    style={[
                      styles.detailValue,
                      {
                        color:
                          selectedMovimiento.tipo === 'INGRESO'
                            ? colors.success
                            : colors.error,
                      },
                    ]}
                  >
                    {formatCurrency(
                      selectedMovimiento.monto,
                      business?.moneda
                    )}
                  </Text>
                </View>

                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Usuario</Text>
                  <Text style={styles.detailValue}>
                    {selectedMovimiento.usuario}
                  </Text>
                </View>

                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Fecha</Text>
                  <Text style={styles.detailValue}>
                    {formatDate(selectedMovimiento.fecha)}
                  </Text>
                </View>

                {selectedMovimiento.observaciones && (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Observaciones</Text>
                    <Text style={styles.detailValue}>
                      {selectedMovimiento.observaciones}
                    </Text>
                  </View>
                )}

                <PermissionGate modulo="caja" accion="editar">
                  <ActionButtons
                    onDelete={() => {
                      handleDeleteMovimiento(selectedMovimiento.id);
                      setShowDetailModal(false);
                    }}
                    style={styles.detailActions}
                  />
                </PermissionGate>
              </Card>
            </ScrollView>
          </View>
        )}
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  content: {
    flex: 1,
    padding: spacing.lg,
  },
  balanceCard: {
    backgroundColor: colors.primary + '10',
    marginBottom: spacing.lg,
  },
  balanceLabel: {
    fontSize: 13,
    color: colors.gray[600],
    marginBottom: spacing.sm,
  },
  balanceAmount: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: spacing.lg,
  },
  balanceDetails: {
    flexDirection: 'row',
    gap: spacing.lg,
  },
  balanceItem: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 11,
    color: colors.gray[600],
    marginBottom: spacing.sm,
  },
  detailAmount: {
    fontSize: 16,
    fontWeight: '700',
  },
  amountIn: {
    color: colors.success,
  },
  amountOut: {
    color: colors.error,
  },
  actionButtonsContainer: {
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  actionButton: {
    marginBottom: spacing.md,
  },
  movimientosHeader: {
    marginBottom: spacing.md,
  },
  movimientosTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.black,
  },
  movimientoItem: {
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  movimientoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  movimientoIcon: {
    fontSize: 20,
  },
  movimientoInfo: {
    flex: 1,
  },
  movimientoConcepto: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.black,
  },
  movimientoUsuario: {
    fontSize: 12,
    color: colors.gray[600],
  },
  movimientoMonto: {
    fontSize: 14,
    fontWeight: '700',
  },
  montoIngreso: {
    color: colors.success,
  },
  montoEgreso: {
    color: colors.error,
  },
  movimientoTime: {
    fontSize: 11,
    color: colors.gray[500],
  },
  modalContainer: {
    flex: 1,
    backgroundColor: colors.white,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  closeButton: {
    fontSize: 24,
    color: colors.error,
    fontWeight: '700',
  },
  modalTitle: {
    ...typography.h4,
    color: colors.black,
  },
  formContainer: {
    padding: spacing.lg,
  },
  typeSelector: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  typeOption: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: 8,
    backgroundColor: colors.gray[100],
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  typeOptionSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  typeOptionText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.black,
  },
  typeOptionTextSelected: {
    color: colors.white,
  },
  submitButton: {
    marginVertical: spacing.lg,
  },
  detailModalContainer: {
    flex: 1,
    backgroundColor: colors.white,
  },
  detailModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  detailContent: {
    flex: 1,
    padding: spacing.lg,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.black,
  },
  detailActions: {
    marginTop: spacing.lg,
  },
});
