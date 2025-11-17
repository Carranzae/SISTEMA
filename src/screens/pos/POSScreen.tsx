import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Text,
  Alert,
} from 'react-native';
import { Header, Button, Modal, Input, Loading, Card } from '@components/common';
import { ProductSearch, Cart } from '@components/pos';
import { colors, spacing, typography } from '@theme/index';
import { useProducts, useSales, useBusiness } from '@hooks/index';
import { METODOS_PAGO } from '@utils/constants';

export default function POSScreen() {
  const { products, loadProducts, isLoading } = useProducts();
  const { 
    cartItems, 
    subtotal, 
    impuesto, 
    descuento, 
    total,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    completeSale,
    isLoading: saleLoading,
  } = useSales();
  const { business } = useBusiness();

  const [selectedPayMethod, setSelectedPayMethod] = useState('EFECTIVO');
  const [discountPercent, setDiscountPercent] = useState('0');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showDiscountModal, setShowDiscountModal] = useState(false);

  useEffect(() => {
    if (business) {
      loadProducts();
    }
  }, [business]);

  const handleSelectProduct = (product: any) => {
    const newItem = {
      producto_id: product.id,
      cantidad: 1,
      precio_unitario: product.precio_venta,
      subtotal: product.precio_venta,
    };
    addToCart(newItem);
  };

  const handleApplyDiscount = (percent: string) => {
    const discountAmount = (subtotal * parseInt(percent || '0')) / 100;
    // Update discount in store
    setDiscountPercent(percent);
    setShowDiscountModal(false);
  };

  const handleCompleteSale = async () => {
    if (cartItems.length === 0) {
      Alert.alert('Error', 'El carrito está vacío');
      return;
    }

    try {
      await completeSale({
        tipo: 'CONTADO',
        metodo_pago: selectedPayMethod,
        items: cartItems,
        subtotal,
        impuesto,
        descuento,
        total,
      });

      Alert.alert('✅ Éxito', 'Venta registrada correctamente');
      clearCart();
      setShowPaymentModal(false);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Error al registrar la venta');
    }
  };

  if (isLoading) return <Loading fullScreen />;

  return (
    <View style={styles.container}>
      <Header
        title="🛍️ Punto de Venta"
        subtitle={`${business?.nombre_comercial}`}
      />

      <View style={styles.content}>
        <View style={styles.searchSection}>
          <ProductSearch
            products={products}
            onSelectProduct={handleSelectProduct}
            loading={isLoading}
          />
        </View>

        <View style={styles.cartSection}>
          <Cart
            items={cartItems}
            subtotal={subtotal}
            impuesto={impuesto}
            descuento={descuento}
            total={total}
            onRemoveItem={removeFromCart}
            onUpdateQuantity={updateQuantity}
          />
        </View>
      </View>

      <View style={styles.actionBar}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => setShowDiscountModal(true)}
        >
          <Text style={styles.actionLabel}>% Descuento</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.cancelButton]}
          onPress={clearCart}
        >
          <Text style={styles.actionLabel}>🗑️ Limpiar</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.payButton]}
          onPress={() => setShowPaymentModal(true)}
          disabled={cartItems.length === 0}
        >
          <Text style={styles.actionLabel}>💳 Cobrar</Text>
        </TouchableOpacity>
      </View>

      {/* Modal de Descuento */}
      <Modal visible={showDiscountModal} onClose={() => setShowDiscountModal(false)}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Aplicar Descuento</Text>
          <Input
            placeholder="Porcentaje (%)"
            value={discountPercent}
            onChangeText={setDiscountPercent}
            keyboardType="numeric"
          />
          <Button
            label="Aplicar"
            onPress={() => handleApplyDiscount(discountPercent)}
            fullWidth
          />
        </View>
      </Modal>

      {/* Modal de Pago */}
      <Modal visible={showPaymentModal} onClose={() => setShowPaymentModal(false)}>
        <ScrollView style={styles.modalContent}>
          <Text style={styles.modalTitle}>Método de Pago</Text>

          {METODOS_PAGO.map((method) => (
            <TouchableOpacity
              key={method}
              style={[
                styles.payMethodOption,
                selectedPayMethod === method && styles.payMethodSelected,
              ]}
              onPress={() => setSelectedPayMethod(method)}
            >
              <Text style={styles.payMethodText}>{method}</Text>
              {selectedPayMethod === method && (
                <Text style={styles.checkmark}>✓</Text>
              )}
            </TouchableOpacity>
          ))}

          <Card style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal:</Text>
              <Text style={styles.summaryValue}>
                S/ {subtotal.toFixed(2)}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>IGV (18%):</Text>
              <Text style={styles.summaryValue}>
                S/ {impuesto.toFixed(2)}
              </Text>
            </View>
            {descuento > 0 && (
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Descuento:</Text>
                <Text style={styles.summaryValueDiscount}>
                  -S/ {descuento.toFixed(2)}
                </Text>
              </View>
            )}
            <View style={styles.divider} />
            <View style={styles.summaryRow}>
              <Text style={styles.totalLabel}>TOTAL A COBRAR:</Text>
              <Text style={styles.totalValue}>S/ {total.toFixed(2)}</Text>
            </View>
          </Card>

          <Button
            label="Confirmar Pago"
            onPress={handleCompleteSale}
            fullWidth
            loading={saleLoading}
            style={styles.confirmButton}
          />

          <Button
            label="Cancelar"
            onPress={() => setShowPaymentModal(false)}
            variant="ghost"
            fullWidth
          />
        </ScrollView>
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
    flexDirection: 'row',
  },
  searchSection: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRightWidth: 1,
    borderRightColor: colors.gray[200],
  },
  cartSection: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  actionBar: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.gray[200],
    backgroundColor: colors.gray[50],
  },
  actionButton: {
    flex: 1,
    backgroundColor: colors.gray[200],
    paddingVertical: spacing.md,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: colors.error + '20',
  },
  payButton: {
    backgroundColor: colors.success,
  },
  actionLabel: {
    fontWeight: '600',
    fontSize: 12,
    color: colors.black,
  },
  modalContent: {
    padding: spacing.lg,
  },
  modalTitle: {
    ...typography.h3,
    marginBottom: spacing.lg,
    color: colors.black,
  },
  payMethodOption: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    marginBottom: spacing.md,
    borderRadius: 8,
    backgroundColor: colors.gray[50],
    borderWidth: 2,
    borderColor: 'transparent',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  payMethodSelected: {
    backgroundColor: colors.primary + '15',
    borderColor: colors.primary,
  },
  payMethodText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.black,
  },
  checkmark: {
    fontSize: 18,
    color: colors.primary,
    fontWeight: '700',
  },
  summaryCard: {
    marginVertical: spacing.lg,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  summaryLabel: {
    fontSize: 14,
    color: colors.gray[700],
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.black,
  },
  summaryValueDiscount: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.error,
  },
  divider: {
    height: 1,
    backgroundColor: colors.gray[300],
    marginVertical: spacing.md,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.black,
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primary,
  },
  confirmButton: {
    marginBottom: spacing.md,
  },
});
