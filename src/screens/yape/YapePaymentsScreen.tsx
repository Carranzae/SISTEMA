import React, { useState, useEffect } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Text,
  Alert,
} from 'react-native';
import { Header, Button, Modal, Input, Card, Loading } from '@components/common';
import { colors, spacing, typography } from '@theme/index';
import { useBusiness } from '@hooks/useBusiness';
import { yapeService } from '@services/integration/yape.service';
import { formatCurrency, formatDate } from '@utils/formatters';
import type { PagoYapePlin } from '@types/database';

export default function YapePaymentsScreen() {
  const { business } = useBusiness();
  const [payments, setPayments] = useState<PagoYapePlin[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<PagoYapePlin | null>(
    null
  );
  const [formData, setFormData] = useState({
    monto: '',
    numero_operacion: '',
    nombre_remitente: '',
    plataforma: 'YAPE' as 'YAPE' | 'PLIN',
  });

  useEffect(() => {
    loadPayments();
  }, [business]);

  const loadPayments = async () => {
    if (!business) return;
    setIsLoading(true);
    try {
      const data = await yapeService.getPendingPayments(business.id);
      setPayments(data);
    } catch (error) {
      console.error('Error loading payments:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddPayment = async () => {
    if (!formData.monto.trim()) {
      Alert.alert('Error', 'El monto es requerido');
      return;
    }

    if (!business) return;

    setIsLoading(true);
    try {
      const payment = await yapeService.registerPayment(business.id, {
        monto: parseFloat(formData.monto),
        numero_operacion: formData.numero_operacion,
        nombre_remitente: formData.nombre_remitente,
        plataforma: formData.plataforma,
      });

      Alert.alert('✅ Éxito', 'Pago registrado correctamente');
      setFormData({
        monto: '',
        numero_operacion: '',
        nombre_remitente: '',
        plataforma: 'YAPE',
      });
      setShowAddModal(false);
      loadPayments();
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRejectPayment = async (paymentId: string) => {
    Alert.alert('Confirmar', '¿Rechazar este pago?', [
      { text: 'Cancelar' },
      {
        text: 'Rechazar',
        onPress: async () => {
          try {
            await yapeService.rejectPayment(paymentId);
            Alert.alert('✅ Éxito', 'Pago rechazado');
            loadPayments();
          } catch (error: any) {
            Alert.alert('Error', error.message);
          }
        },
        style: 'destructive',
      },
    ]);
  };

  const renderPayment = ({ item }: { item: PagoYapePlin }) => (
    <Card style={styles.paymentCard}>
      <View style={styles.paymentHeader}>
        <View>
          <Text style={styles.paymentPlatform}>
            {item.plataforma === 'YAPE' ? '🟡 Yape' : '🔵 Plin'}
          </Text>
          <Text style={styles.paymentRemitente}>{item.nombre_remitente}</Text>
        </View>
        <Text style={styles.paymentAmount}>
          {formatCurrency(item.monto, business?.moneda)}
        </Text>
      </View>

      <View style={styles.paymentDetails}>
        {item.numero_operacion && (
          <Text style={styles.detail}>
            Operación: {item.numero_operacion}
          </Text>
        )}
        <Text style={styles.detail}>{formatDate(item.created_at)}</Text>
      </View>

      <View style={styles.paymentStatus}>
        <View
          style={[
            styles.statusBadge,
            item.estado === 'PENDIENTE'
              ? styles.statusPending
              : styles.statusAssociated,
          ]}
        >
          <Text style={styles.statusText}>{item.estado}</Text>
        </View>
      </View>

      {item.estado === 'PENDIENTE' && (
        <View style={styles.paymentActions}>
          <TouchableOpacity
            style={[styles.actionButton, styles.rejectButton]}
            onPress={() => handleRejectPayment(item.id)}
          >
            <Text style={styles.actionText}>❌ Rechazar</Text>
          </TouchableOpacity>
        </View>
      )}
    </Card>
  );

  if (isLoading && payments.length === 0) return <Loading fullScreen />;

  return (
    <View style={styles.container}>
      <Header
        title="💳 Pagos Yape/Plin"
        subtitle={`${payments.length} pendiente(s)`}
        rightAction={{
          label: '+ Nuevo',
          onPress: () => setShowAddModal(true),
        }}
      />

      {payments.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyEmoji}>💳</Text>
          <Text style={styles.emptyText}>No hay pagos pendientes</Text>
          <Button
            label="Registrar Pago"
            onPress={() => setShowAddModal(true)}
            style={styles.emptyButton}
          />
        </View>
      ) : (
        <FlatList
          data={payments}
          renderItem={renderPayment}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
        />
      )}

      {/* Modal Agregar Pago */}
      <Modal visible={showAddModal} onClose={() => setShowAddModal(false)}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Registrar Pago</Text>

          <View style={styles.platformSelector}>
            {['YAPE', 'PLIN'].map((platform) => (
              <TouchableOpacity
                key={platform}
                style={[
                  styles.platformOption,
                  formData.plataforma === platform &&
                    styles.platformOptionSelected,
                ]}
                onPress={() =>
                  setFormData({
                    ...formData,
                    plataforma: platform as 'YAPE' | 'PLIN',
                  })
                }
              >
                <Text
                  style={[
                    styles.platformText,
                    formData.plataforma === platform &&
                      styles.platformTextSelected,
                  ]}
                >
                  {platform === 'YAPE' ? '🟡 Yape' : '🔵 Plin'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Input
            label="Monto *"
            placeholder="0.00"
            value={formData.monto}
            onChangeText={(v) => setFormData({ ...formData, monto: v })}
            keyboardType="decimal-pad"
          />

          <Input
            label="Número de Operación"
            placeholder="Ej: 12345678"
            value={formData.numero_operacion}
            onChangeText={(v) =>
              setFormData({ ...formData, numero_operacion: v })
            }
            keyboardType="numeric"
          />

          <Input
            label="Nombre del Remitente"
            placeholder="Nombre de quien paga"
            value={formData.nombre_remitente}
            onChangeText={(v) =>
              setFormData({ ...formData, nombre_remitente: v })
            }
          />

          <Button
            label="Registrar Pago"
            onPress={handleAddPayment}
            fullWidth
            loading={isLoading}
            style={styles.saveButton}
          />

          <Button
            label="Cancelar"
            onPress={() => setShowAddModal(false)}
            variant="ghost"
            fullWidth
          />
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  list: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  paymentCard: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  paymentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  paymentPlatform: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.black,
    marginBottom: spacing.sm,
  },
  paymentRemitente: {
    fontSize: 12,
    color: colors.gray[600],
  },
  paymentAmount: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primary,
  },
  paymentDetails: {
    backgroundColor: colors.gray[50],
    borderRadius: 6,
    padding: spacing.md,
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  detail: {
    fontSize: 12,
    color: colors.gray[700],
  },
  paymentStatus: {
    marginBottom: spacing.md,
  },
  statusBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  statusPending: {
    backgroundColor: colors.warning + '20',
  },
  statusAssociated: {
    backgroundColor: colors.success + '20',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.black,
  },
  paymentActions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  actionButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: 6,
    alignItems: 'center',
  },
  rejectButton: {
    backgroundColor: colors.error + '20',
  },
  actionText: {
    fontSize: 12,
    fontWeight: '600',
  },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: spacing.lg,
  },
  emptyText: {
    ...typography.h3,
    color: colors.gray[600],
    marginBottom: spacing.lg,
  },
  emptyButton: {
    minWidth: 200,
  },
  modalContent: {
    padding: spacing.lg,
  },
  modalTitle: {
    ...typography.h3,
    marginBottom: spacing.lg,
    color: colors.black,
  },
  platformSelector: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  platformOption: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: 8,
    backgroundColor: colors.gray[100],
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  platformOptionSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  platformText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.black,
  },
  platformTextSelected: {
    color: colors.white,
  },
  saveButton: {
    marginVertical: spacing.lg,
  },
});
