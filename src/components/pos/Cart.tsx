import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Card } from '@components/common';
import { colors, spacing } from '@theme/index';
import type { VentaItem } from '@types/database';

interface CartProps {
  items: VentaItem[];
  subtotal: number;
  impuesto: number;
  descuento: number;
  total: number;
  onRemoveItem: (productId: string) => void;
  onUpdateQuantity: (productId: string, quantity: number) => void;
}

export const Cart: React.FC<CartProps> = ({
  items,
  subtotal,
  impuesto,
  descuento,
  total,
  onRemoveItem,
  onUpdateQuantity,
}) => {
  if (items.length === 0) {
    return (
      <Card>
        <Text style={styles.empty}>🛒 Carrito vacío</Text>
      </Card>
    );
  }

  const renderItem = ({ item }: { item: VentaItem }) => (
    <View style={styles.cartItem}>
      <View style={styles.itemInfo}>
        <Text style={styles.itemName}>{item.producto_id}</Text>
        <Text style={styles.itemPrice}>
          S/ {item.precio_unitario.toFixed(2)} x {item.cantidad}
        </Text>
      </View>

      <View style={styles.itemActions}>
        <TouchableOpacity
          onPress={() => onUpdateQuantity(item.producto_id, item.cantidad - 1)}
        >
          <Text style={styles.actionButton}>-</Text>
        </TouchableOpacity>
        <Text style={styles.quantity}>{item.cantidad}</Text>
        <TouchableOpacity
          onPress={() => onUpdateQuantity(item.producto_id, item.cantidad + 1)}
        >
          <Text style={styles.actionButton}>+</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => onRemoveItem(item.producto_id)}
          style={styles.removeButton}
        >
          <Text style={styles.removeIcon}>🗑️</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.itemTotal}>S/ {item.subtotal.toFixed(2)}</Text>
    </View>
  );

  return (
    <Card>
      <FlatList
        data={items}
        renderItem={renderItem}
        keyExtractor={(item) => item.producto_id}
        scrollEnabled={false}
        nestedScrollEnabled={false}
      />

      <View style={styles.divider} />

      <View style={styles.summary}>
        <View style={styles.summaryRow}>
          <Text style={styles.label}>Subtotal:</Text>
          <Text style={styles.value}>S/ {subtotal.toFixed(2)}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.label}>IGV (18%):</Text>
          <Text style={styles.value}>S/ {impuesto.toFixed(2)}</Text>
        </View>
        {descuento > 0 && (
          <View style={styles.summaryRow}>
            <Text style={styles.label}>Descuento:</Text>
            <Text style={styles.valueDiscount}>-S/ {descuento.toFixed(2)}</Text>
          </View>
        )}
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>TOTAL:</Text>
          <Text style={styles.totalValue}>S/ {total.toFixed(2)}</Text>
        </View>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  empty: {
    textAlign: 'center',
    fontSize: 16,
    color: colors.gray[600],
    paddingVertical: spacing.xl,
  },
  cartItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.black,
  },
  itemPrice: {
    fontSize: 12,
    color: colors.gray[600],
    marginTop: 2,
  },
  itemActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginHorizontal: spacing.md,
  },
  actionButton: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primary,
    paddingHorizontal: spacing.sm,
  },
  quantity: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.black,
    minWidth: 30,
    textAlign: 'center',
  },
  removeButton: {
    marginLeft: spacing.sm,
  },
  removeIcon: {
    fontSize: 16,
  },
  itemTotal: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primary,
  },
  divider: {
    height: 1,
    backgroundColor: colors.gray[300],
    marginVertical: spacing.md,
  },
  summary: {
    gap: spacing.sm,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  label: {
    fontSize: 13,
    color: colors.gray[700],
  },
  value: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.black,
  },
  valueDiscount: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.error,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTopMargin: spacing.md,
    borderTopWidth: 2,
    borderTopColor: colors.gray[300],
    paddingTop: spacing.md,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.black,
  },
  totalValue: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary,
  },
});
