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
import { formatCurrency } from '@utils/formatters';

interface CashMovement {
  id: string;
  type: 'INGRESO' | 'EGRESO';
  concept: string;
  amount: number;
  created_at: string;
}

export default function CashScreen() {
  const { business } = useBusiness();
  const [isOpen, setIsOpen] = useState(false);
  const [movements, setMovements] = useState<CashMovement[]>([]);
  const [totalIn, setTotalIn] = useState(0);
  const [totalOut, setTotalOut] = useState(0);
  const [showMovementModal, setShowMovementModal] = useState(false);
  const [movementType, setMovementType] = useState<'INGRESO' | 'EGRESO'>('INGRESO');
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    concept: '',
    amount: '',
  });

  useEffect(() => {
    loadCashData();
  }, [business]);

  const loadCashData = async () => {
    if (!business) return;
    try {
      // Obtener movimientos del día
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const { data, error } = await supabase
        .from('cash_movements')
        .select('*')
        .eq('negocio_id', business.id)
        .gte('created_at', today.toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;

      setMovements(data || []);

      // Calcular totales
      const inTotal = (data || [])
        .filter((m) => m.type === 'INGRESO')
        .reduce((sum, m) => sum + m.amount, 0);

      const outTotal = (data || [])
        .filter((m) => m.type === 'EGRESO')
        .reduce((sum, m) => sum + m.amount, 0);

      setTotalIn(inTotal);
      setTotalOut(outTotal);
    } catch (error) {
      console.error('Error loading cash data:', error);
    }
  };

  const handleAddMovement = async () => {
    if (!formData.concept.trim() || !formData.amount.trim()) {
      Alert.alert('Error', 'Todos los campos son requeridos');
      return;
    }

    if (!business) return;

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('cash_movements')
        .insert([
          {
            negocio_id: business.id,
            type: movementType,
            concept: formData.concept,
            amount: parseFloat(formData.amount),
          },
        ]);

      if (error) throw error;

      Alert.alert('✅ Éxito', 'Movimiento registrado');
      setFormData({ concept: '', amount: '' });
      setShowMovementModal(false);
      loadCashData();
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenCash = async () => {
    if (!business) return;
    try {
      const { error } = await supabase
        .from('cash_register')
        .insert([
          {
            negocio_id: business.id,
            status: 'OPEN',
            opening_balance: 0,
          },
        ]);

      if (error && !error.message.includes('duplicate')) throw error;

      setIsOpen(true);
      Alert.alert('✅ Éxito', 'Caja abierta correctamente');
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  const handleCloseCash = async () => {
    if (!business) return;

    Alert.alert(
      'Cerrar Caja',
      `Total en caja: ${formatCurrency(totalIn - totalOut, business.moneda)}\n\n¿Deseas cerrar la caja?`,
      [
        { text: 'Cancelar' },
        {
          text: 'Cerrar',
          onPress: async () => {
            try {
              const { error } = await supabase
                .from('cash_register')
                .update({ status: 'CLOSED', closing_balance: totalIn - totalOut })
                .eq('negocio_id', business.id)
                .eq('status', 'OPEN');

              if (error) throw error;

              setIsOpen(false);
              Alert.alert('✅ Éxito', 'Caja cerrada correctamente');
              loadCashData();
            } catch (error: any) {
              Alert.alert('Error', error.message);
            }
          },
        },
      ]
    );
  };

  const balance = totalIn - totalOut;

  return (
    <View style={styles.container}>
      <Header
        title="💰 Caja"
        subtitle={isOpen ? '🟢 Abierta' : '🔴 Cerrada'}
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Balance Summary */}
        <Card>
          <Text style={styles.balanceLabel}>Balance Actual</Text>
          <Text
            style={[
              styles.balanceAmount,
              balance < 0 && styles.balanceNegative,
            ]}
          >
            {formatCurrency(balance, business?.moneda)}
          </Text>

          <View style={styles.balanceRow}>
            <View style={styles.balanceItem}>
              <Text style={styles.balanceItemLabel}>Ingresos</Text>
              <Text style={styles.balanceItemValue}>
                {formatCurrency(totalIn, business?.moneda)}
              </Text>
            </View>
            <View style={styles.balanceItem}>
              <Text style={styles.balanceItemLabel}>Egresos</Text>
              <Text style={styles.balanceItemValue}>
                {formatCurrency(totalOut, business?.moneda)}
              </Text>
            </View>
          </View>
        </Card>

        {/* Cash Status */}
        <Card>
          <View style={styles.statusContainer}>
            <View
              style={[
                styles.statusBadge,
                isOpen ? styles.statusOpen : styles.statusClosed,
              ]}
            >
              <Text style={styles.statusText}>
                {isOpen ? 'Caja Abierta' : 'Caja Cerrada'}
              </Text>
            </View>

            {isOpen ? (
              <Button
                label="🔴 Cerrar Caja"
                onPress={handleCloseCash}
                variant="danger"
              />
            ) : (
              <Button
                label="🟢 Abrir Caja"
                onPress={handleOpenCash}
                variant="secondary"
              />
            )}
          </View>
        </Card>

        {/* Movements History */}
        <Card>
          <View style={styles.historyHeader}>
            <Text style={styles.sectionTitle}>📋 Movimientos de Hoy</Text>
            <TouchableOpacity onPress={() => setShowMovementModal(true)}>
              <Text style={styles.addButton}>+ Nuevo</Text>
            </TouchableOpacity>
          </View>

          {movements.length === 0 ? (
            <Text style={styles.emptyText}>Sin movimientos</Text>
          ) : (
            movements.map((movement) => (
              <View key={movement.id} style={styles.movementItem}>
                <View style={styles.movementInfo}>
                  <Text style={styles.movementConcept}>
                    {movement.concept}
                  </Text>
                  <Text style={styles.movementTime}>
                    {new Date(movement.created_at).toLocaleTimeString('es-PE')}
                  </Text>
                </View>
                <Text
                  style={[
                    styles.movementAmount,
                    movement.type === 'INGRESO'
                      ? styles.amountIn
                      : styles.amountOut,
                  ]}
                >
                  {movement.type === 'INGRESO' ? '+' : '-'}
                  {formatCurrency(movement.amount, business?.moneda)}
                </Text>
              </View>
            ))
          )}
        </Card>
      </ScrollView>

      {/* Modal Nuevo Movimiento */}
      <Modal
        visible={showMovementModal}
        onClose={() => setShowMovementModal(false)}
      >
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Registrar Movimiento</Text>

          <View style={styles.typeSelector}>
            {['INGRESO', 'EGRESO'].map((type) => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.typeOption,
                  movementType === type && styles.typeOptionSelected,
                ]}
                onPress={() => setMovementType(type as any)}
              >
                <Text
                  style={[
                    styles.typeOptionText,
                    movementType === type &&
                      styles.typeOptionTextSelected,
                  ]}
                >
                  {type === 'INGRESO' ? '⬆️ Ingreso' : '⬇️ Egreso'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Input
            label="Concepto"
            placeholder="Ej: Venta de efectivo, Gasto de papelería"
            value={formData.concept}
            onChangeText={(v) => setFormData({ ...formData, concept: v })}
          />

          <Input
            label="Monto"
            placeholder="0.00"
            value={formData.amount}
            onChangeText={(v) => setFormData({ ...formData, amount: v })}
            keyboardType="decimal-pad"
          />

          <Button
            label="Registrar Movimiento"
            onPress={handleAddMovement}
            fullWidth
            loading={isLoading}
            style={styles.saveButton}
          />

          <Button
            label="Cancelar"
            onPress={() => setShowMovementModal(false)}
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
  content: {
    flex: 1,
    padding: spacing.lg,
  },
  balanceLabel: {
    fontSize: 14,
    color: colors.gray[600],
    marginBottom: spacing.md,
  },
  balanceAmount: {
    fontSize: 36,
    fontWeight: '700',
    color: colors.success,
    marginBottom: spacing.lg,
  },
  balanceNegative: {
    color: colors.error,
  },
  balanceRow: {
    flexDirection: 'row',
    gap: spacing.lg,
  },
  balanceItem: {
    flex: 1,
    backgroundColor: colors.gray[50],
    borderRadius: 8,
    padding: spacing.md,
    alignItems: 'center',
  },
  balanceItemLabel: {
    fontSize: 12,
    color: colors.gray[600],
    marginBottom: spacing.sm,
  },
  balanceItemValue: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.black,
  },
  statusContainer: {
    gap: spacing.md,
  },
  statusBadge: {
    paddingVertical: spacing.md,
    borderRadius: 8,
    alignItems: 'center',
  },
  statusOpen: {
    backgroundColor: colors.success + '20',
  },
  statusClosed: {
    backgroundColor: colors.error + '20',
  },
  statusText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.black,
  },
  sectionTitle: {
    ...typography.h4,
    color: colors.black,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  addButton: {
    color: colors.primary,
    fontWeight: '600',
    fontSize: 12,
  },
  emptyText: {
    textAlign: 'center',
    color: colors.gray[600],
    paddingVertical: spacing.lg,
  },
  movementItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  movementInfo: {
    flex: 1,
  },
  movementConcept: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.black,
    marginBottom: spacing.sm,
  },
  movementTime: {
    fontSize: 12,
    color: colors.gray[600],
  },
  movementAmount: {
    fontSize: 14,
    fontWeight: '700',
  },
  amountIn: {
    color: colors.success,
  },
  amountOut: {
    color: colors.error,
  },
  modalContent: {
    padding: spacing.lg,
  },
  modalTitle: {
    ...typography.h3,
    marginBottom: spacing.lg,
    color: colors.black,
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
    fontSize: 14,
    fontWeight: '600',
    color: colors.black,
  },
  typeOptionTextSelected: {
    color: colors.white,
  },
  saveButton: {
    marginVertical: spacing.lg,
  },
});
