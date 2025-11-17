import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Text,
  Alert,
  FlatList,
} from 'react-native';
import { Header, Button, Modal, Input, Card, Loading } from '@components/common';
import { colors, spacing, typography } from '@theme/index';
import { useBusiness } from '@hooks/useBusiness';
import { useAuthStore } from '@store/auth.store';
import { cashService } from '@services/supabase/cash.service';
import { formatCurrency, formatDate } from '@utils/formatters';
import type { CashRegister, CashMovement } from '@types/cash';

export default function CashDetailedScreen() {
  const { business } = useBusiness();
  const { user } = useAuthStore();

  const [cashRegister, setCashRegister] = useState<CashRegister | null>(null);
  const [movements, setMovements] = useState<CashMovement[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showOpenModal, setShowOpenModal] = useState(false);
  const [showMovementModal, setShowMovementModal] = useState(false);
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [showConciliate, setShowConciliate] = useState(false);

  const [openingBalance, setOpeningBalance] = useState('');
  const [movementData, setMovementData] = useState({
    tipo: 'INGRESO' as 'INGRESO' | 'EGRESO',
    concepto: '',
    monto: '',
  });
  const [physicalBalance, setPhysicalBalance] = useState('');
  const [conciliationNotes, setConciliationNotes] = useState('');

  useEffect(() => {
    loadCashData();
  }, [business]);

  const loadCashData = async () => {
    if (!business) return;
    setIsLoading(true);
    try {
      const openCash = await cashService.getOpenCash(business.id);
      setCashRegister(openCash);

      if (openCash) {
        const dayMovements = await cashService.getDayMovements(openCash.id);
        setMovements(dayMovements);
      }
    } catch (error) {
      console.error('Error loading cash data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenCash = async () => {
    if (!openingBalance.trim() || !business || !user) {
      Alert.alert('Error', 'Ingresa el saldo de apertura');
      return;
    }

    setIsLoading(true);
    try {
      const newCash = await cashService.openCash(
        business.id,
        user.id,
        parseFloat(openingBalance)
      );
      setCashRegister(newCash);
      setMovements([]);
      setOpeningBalance('');
      setShowOpenModal(false);
      Alert.alert('✅ Éxito', 'Caja abierta correctamente');
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddMovement = async () => {
    if (
      !movementData.concepto.trim() ||
      !movementData.monto.trim() ||
      !cashRegister ||
      !user
    ) {
      Alert.alert('Error', 'Completa todos los campos');
      return;
    }

    setIsLoading(true);
    try {
      const newMovement = await cashService.addMovement(
        cashRegister.id,
        business!.id,
        user.id,
        {
          tipo: movementData.tipo,
          concepto: movementData.concepto,
          monto: parseFloat(movementData.monto),
        }
      );

      setMovements([newMovement, ...movements]);
      setMovementData({ tipo: 'INGRESO', concepto: '', monto: '' });
      setShowMovementModal(false);
      Alert.alert('✅ Éxito', 'Movimiento registrado');
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseCash = async () => {
    if (!physicalBalance.trim() || !cashRegister || !user) {
      Alert.alert('Error', 'Ingresa el saldo físico');
      return;
    }

    setIsLoading(true);
    try {
      await cashService.closeCash(
        cashRegister.id,
        user.id,
        parseFloat(physicalBalance)
      );

      setCashRegister(null);
      setMovements([]);
      setPhysicalBalance('');
      setShowCloseModal(false);
      Alert.alert('✅ Éxito', 'Caja cerrada correctamente');
      loadCashData();
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConciliate = async () => {
    if (!physicalBalance.trim() || !cashRegister) {
      Alert.alert('Error', 'Ingresa el saldo físico');
      return;
    }

    setIsLoading(true);
    try {
      const reconciliation = await cashService.conciliateCash(
        cashRegister.id,
        parseFloat(physicalBalance),
        conciliationNotes
      );

      if (reconciliation.conciliado) {
        Alert.alert('✅ Conciliación Exitosa', 'Los saldos coinciden');
      } else {
        Alert.alert(
          '⚠️ Diferencia Detectada',
          `Diferencia: ${formatCurrency(reconciliation.diferencia, business?.moneda)}`
        );
      }

      setShowConciliate(false);
      setPhysicalBalance('');
      setConciliationNotes('');
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const summary = cashRegister
    ? {
        saldo_apertura: cashRegister.saldo_apertura,
        total_ingresos: movements
          .filter((m) => m.tipo === 'INGRESO')
          .reduce((sum, m) => sum + m.monto, 0),
        total_egresos: movements
          .filter((m) => m.tipo === 'EGRESO')
          .reduce((sum, m) => sum + m.monto, 0),
      }
    : null;

  if (isLoading && !cashRegister) return <Loading fullScreen />;

  return (
    <View style={styles.container}>
      <Header
        title="💰 Caja Detallada"
        subtitle={cashRegister ? '🟢 Abierta' : '🔴 Cerrada'}
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {cashRegister ? (
          <>
            {/* Resumen */}
            <Card>
              <Text style={styles.sectionTitle}>📊 Resumen</Text>
              <View style={styles.summaryGrid}>
                <SummaryItem
                  label="Saldo Apertura"
                  value={formatCurrency(
                    summary?.saldo_apertura || 0,
                    business?.moneda
                  )}
                  emoji="📍"
                />
                <SummaryItem
                  label="Ingresos"
                  value={formatCurrency(
                    summary?.total_ingresos || 0,
                    business?.moneda
                  )}
                  emoji="📈"
                  color={colors.success}
                />
                <SummaryItem
                  label="Egresos"
                  value={formatCurrency(
                    summary?.total_egresos || 0,
                    business?.moneda
                  )}
                  emoji="📉"
                  color={colors.error}
                />
                <SummaryItem
                  label="Saldo Esperado"
                  value={formatCurrency(
                    (summary?.saldo_apertura || 0) +
                      (summary?.total_ingresos || 0) -
                      (summary?.total_egresos || 0),
                    business?.moneda
                  )}
                  emoji="💵"
                  color={colors.primary}
                />
              </View>
            </Card>

            {/* Movimientos */}
            <Card>
              <View style={styles.movementsHeader}>
                <Text style={styles.sectionTitle}>📋 Movimientos</Text>
                <TouchableOpacity onPress={() => setShowMovementModal(true)}>
                  <Text style={styles.addButton}>+ Nuevo</Text>
                </TouchableOpacity>
              </View>

              <FlatList
                data={movements}
                renderItem={({ item }) => (
                  <View style={styles.movementRow}>
                    <View style={styles.movementInfo}>
                      <Text style={styles.movementConcept}>
                        {item.concepto}
                      </Text>
                      <Text style={styles.movementTime}>
                        {new Date(item.created_at).toLocaleTimeString('es-PE')}
                      </Text>
                    </View>
                    <Text
                      style={[
                        styles.movementAmount,
                        item.tipo === 'INGRESO'
                          ? styles.amountIn
                          : styles.amountOut,
                      ]}
                    >
                      {item.tipo === 'INGRESO' ? '+' : '-'}
                      {formatCurrency(item.monto, business?.moneda)}
                    </Text>
                  </View>
                )}
                keyExtractor={(item) => item.id}
                scrollEnabled={false}
                nestedScrollEnabled={false}
              />
            </Card>

            {/* Acciones */}
            <Card>
              <Button
                label="🔍 Conciliar Caja"
                onPress={() => setShowConciliate(true)}
                variant="secondary"
                fullWidth
                style={styles.actionButton}
              />
              <Button
                label="🔴 Cerrar Caja"
                onPress={() => setShowCloseModal(true)}
                variant="danger"
                fullWidth
              />
            </Card>
          </>
        ) : (
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>💰</Text>
            <Text style={styles.emptyText}>Caja Cerrada</Text>
            <Button
              label="🟢 Abrir Caja"
              onPress={() => setShowOpenModal(true)}
              style={styles.emptyButton}
            />
          </View>
        )}
      </ScrollView>

      {/* Modal Abrir Caja */}
      <Modal visible={showOpenModal} onClose={() => setShowOpenModal(false)}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Abrir Caja</Text>
          <Input
            label="Saldo de Apertura"
            placeholder="0.00"
            value={openingBalance}
            onChangeText={setOpeningBalance}
            keyboardType="decimal-pad"
          />
          <Button
            label="Abrir"
            onPress={handleOpenCash}
            fullWidth
            loading={isLoading}
            style={styles.saveButton}
          />
          <Button
            label="Cancelar"
            onPress={() => setShowOpenModal(false)}
            variant="ghost"
            fullWidth
          />
        </View>
      </Modal>

      {/* Modal Movimiento */}
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
                  movementData.tipo === type && styles.typeOptionSelected,
                ]}
                onPress={() =>
                  setMovementData({
                    ...movementData,
                    tipo: type as 'INGRESO' | 'EGRESO',
                  })
                }
              >
                <Text
                  style={[
                    styles.typeOptionText,
                    movementData.tipo === type &&
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
            placeholder="Ej: Venta de efectivo"
            value={movementData.concepto}
            onChangeText={(v) =>
              setMovementData({ ...movementData, concepto: v })
            }
          />

          <Input
            label="Monto"
            placeholder="0.00"
            value={movementData.monto}
            onChangeText={(v) =>
              setMovementData({ ...movementData, monto: v })
            }
            keyboardType="decimal-pad"
          />

          <Button
            label="Registrar"
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

      {/* Modal Conciliar */}
      <Modal visible={showConciliate} onClose={() => setShowConciliate(false)}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Conciliar Caja</Text>
          <Card style={styles.infoCard}>
            <Text style={styles.infoLabel}>Saldo en Sistema:</Text>
            <Text style={styles.infoValue}>
              {formatCurrency(
                (summary?.saldo_apertura || 0) +
                  (summary?.total_ingresos || 0) -
                  (summary?.total_egresos || 0),
                business?.moneda
              )}
            </Text>
          </Card>

          <Input
            label="Saldo Físico"
            placeholder="0.00"
            value={physicalBalance}
            onChangeText={setPhysicalBalance}
            keyboardType="decimal-pad"
          />

          <Input
            label="Notas (Opcional)"
            placeholder="Observaciones"
            value={conciliationNotes}
            onChangeText={setConciliationNotes}
            multiline
          />

          <Button
            label="Conciliar"
            onPress={handleConciliate}
            fullWidth
            loading={isLoading}
            style={styles.saveButton}
          />
          <Button
            label="Cancelar"
            onPress={() => setShowConciliate(false)}
            variant="ghost"
            fullWidth
          />
        </View>
      </Modal>

      {/* Modal Cerrar Caja */}
      <Modal visible={showCloseModal} onClose={() => setShowCloseModal(false)}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Cerrar Caja</Text>
          <Input
            label="Saldo Físico Final"
            placeholder="0.00"
            value={physicalBalance}
            onChangeText={setPhysicalBalance}
            keyboardType="decimal-pad"
          />
          <Button
            label="Cerrar Caja"
            onPress={handleCloseCash}
            fullWidth
            loading={isLoading}
            style={styles.saveButton}
            variant="danger"
          />
          <Button
            label="Cancelar"
            onPress={() => setShowCloseModal(false)}
            variant="ghost"
            fullWidth
          />
        </View>
      </Modal>
    </View>
  );
}

interface SummaryItemProps {
  label: string;
  value: string;
  emoji: string;
  color?: string;
}

const SummaryItem: React.FC<SummaryItemProps> = ({
  label,
  value,
  emoji,
  color = colors.black,
}) => (
  <View style={styles.summaryItem}>
    <Text style={styles.summaryEmoji}>{emoji}</Text>
    <Text style={styles.summaryLabel}>{label}</Text>
    <Text style={[styles.summaryValue, { color }]}>{value}</Text>
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
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.black,
    marginBottom: spacing.md,
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  summaryItem: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: colors.gray[50],
    borderRadius: 12,
    padding: spacing.md,
    alignItems: 'center',
  },
  summaryEmoji: {
    fontSize: 24,
    marginBottom: spacing.sm,
  },
  summaryLabel: {
    fontSize: 12,
    color: colors.gray[600],
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
  },
  movementsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  addButton: {
    color: colors.primary,
    fontWeight: '600',
    fontSize: 12,
  },
  movementRow: {
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
  actionButton: {
    marginBottom: spacing.md,
  },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xl,
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
  infoCard: {
    backgroundColor: colors.info + '15',
    marginBottom: spacing.lg,
  },
  infoLabel: {
    fontSize: 13,
    color: colors.gray[700],
    marginBottom: spacing.sm,
  },
  infoValue: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.info,
  },
});
