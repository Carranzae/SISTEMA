import React, { useState } from 'react';
import { View, FlatList, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Input, Card } from '@components/common';
import { colors, spacing } from '@theme/index';
import type { Producto } from '@types/database';

interface ProductSearchProps {
  products: Producto[];
  onSelectProduct: (product: Producto) => void;
  loading?: boolean;
}

export const ProductSearch: React.FC<ProductSearchProps> = ({
  products,
  onSelectProduct,
  loading = false,
}) => {
  const [search, setSearch] = useState('');

  const filtered = products.filter(
    (p) =>
      p.nombre.toLowerCase().includes(search.toLowerCase()) ||
      p.codigo?.toLowerCase().includes(search.toLowerCase())
  );

  const renderProduct = ({ item }: { item: Producto }) => (
    <TouchableOpacity
      style={styles.productItem}
      onPress={() => onSelectProduct(item)}
    >
      <View style={styles.productInfo}>
        <Text style={styles.productName}>{item.nombre}</Text>
        <Text style={styles.productCode}>{item.codigo}</Text>
      </View>
      <Text style={styles.price}>S/ {item.precio_venta.toFixed(2)}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Input
        placeholder="Buscar por nombre o código"
        value={search}
        onChangeText={setSearch}
      />

      {filtered.length > 0 ? (
        <FlatList
          data={filtered}
          renderItem={renderProduct}
          keyExtractor={(item) => item.id}
          nestedScrollEnabled
          scrollEnabled={false}
        />
      ) : (
        <Text style={styles.noResults}>No hay productos</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.lg,
  },
  productItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
    backgroundColor: colors.gray[50],
    marginBottom: spacing.sm,
    borderRadius: 8,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.black,
  },
  productCode: {
    fontSize: 12,
    color: colors.gray[600],
    marginTop: 2,
  },
  price: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
  },
  noResults: {
    textAlign: 'center',
    color: colors.gray[600],
    paddingVertical: spacing.lg,
  },
});
