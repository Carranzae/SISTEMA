import React, { useState, useEffect } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Text,
  Alert,
} from 'react-native';
import { Header, Button, Modal, Input, Loading, Card } from '@components/common';
import { colors, spacing, typography } from '@theme/index';
import { useProducts, useBusiness } from '@hooks/index';
import type { Producto } from '@types/database';

export default function InventoryScreen() {
  const { products, loadProducts, addNewProduct, updateProduct, removeProduct, isLoading } = useProducts();
  const { business } = useBusiness();

  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Producto | null>(null);
  const [formData, setFormData] = useState({
    nombre: '',
    codigo: '',
    precio_compra: '',
    precio_venta: '',
    stock_actual: '',
    stock_minimo: '',
  });

  useEffect(() => {
    if (business) {
      loadProducts();
    }
  }, [business]);

  const resetForm = () => {
    setFormData({
      nombre: '',
      codigo: '',
      precio_compra: '',
      precio_venta: '',
      stock_actual: '',
      stock_minimo: '',
    });
    setSelectedProduct(null);
  };

  const handleSaveProduct = async () => {
    if (!formData.nombre.trim()) {
      Alert.alert('Error', 'El nombre es requerido');
      return;
    }

    try {
      if (selectedProduct) {
        await updateProduct(selectedProduct.id, {
          ...formData,
          precio_compra: parseFloat(formData.precio_compra),
          precio_venta: parseFloat(formData.precio_venta),
          stock_actual: parseInt(formData.stock_actual),
          stock_minimo: parseInt(formData.stock_minimo),
        });
      } else {
        await addNewProduct({
          ...formData,
          precio_compra: parseFloat(formData.precio_compra),
          precio_venta: parseFloat(formData.precio_venta),
          stock_actual: parseInt(formData.stock_actual) || 0,
          stock_minimo: parseInt(formData.stock_minimo) || 0,
        });
      }
      Alert.alert('✅ Éxito', 'Producto guardado correctamente');
      resetForm();
      setShowAddModal(false);
      loadProducts();
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    Alert.alert(
      'Confirmar',
      '¿Deseas eliminar este producto?',
      [
        { text: 'Cancelar', onPress: () => {} },
        {
          text: 'Eliminar',
          onPress: async () => {
            try {
              await removeProduct(productId);
              Alert.alert('✅ Éxito', 'Producto eliminado');
            } catch (error: any) {
              Alert.alert('Error', error.message);
            }
          },
          style: 'destructive',
        },
      ]
    );
  };

  const renderProduct = ({ item }: { item: Producto }) => (
    <Card style={styles.productCard}>
      <View style={styles.productHeader}>
        <View style={styles.productInfo}>
          <Text style={styles.productName}>{item.nombre}</Text>
          <Text style={styles.productCode}>{item.codigo}</Text>
        </View>
        <Text style={styles.productPrice}>S/ {item.precio_venta.toFixed(2)}</Text>
      </View>

      <View style={styles.productStats}>
        <View style={styles.stat}>
          <Text style={styles.statLabel}>Stock</Text>
          <Text style={[
            styles.statValue,
            item.stock_actual < item.stock_minimo && styles.statWarning
          ]}>
            {item.stock_actual}
          </Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statLabel}>Mínimo</Text>
          <Text style={styles.statValue}>{item.stock_minimo}</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statLabel}>Compra</Text>
          <Text style={styles.statValue}>S/ {item.precio_compra.toFixed(2)}</Text>
        </View>
      </View>

      <View style={styles.productActions}>
        <TouchableOpacity
          style={[styles.actionButton, styles.editButton]}
          onPress={() => {
            setSelectedProduct(item);
            setFormData({
              nombre: item.nombre,
              codigo: item.codigo || '',
              precio_compra: item.precio_compra.toString(),
              precio_venta: item.precio_venta.toString(),
              stock_actual: item.stock_actual.toString(),
              stock_minimo: item.stock_minimo.toString(),
            });
            setShowAddModal(true);
          }}
        >
          <Text style={styles.actionText}>✏️ Editar</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => handleDeleteProduct(item.id)}
        >
          <Text style={styles.actionText}>🗑️ Eliminar</Text>
        </TouchableOpacity>
      </View>
    </Card>
  );

  if (isLoading) return <Loading fullScreen />;

  return (
    <View style={styles.container}>
      <Header
        title="📦 Inventario"
        subtitle={`${products.length} productos`}
        rightAction={{
          label: '+ Nuevo',
          onPress: () => {
            resetForm();
            setShowAddModal(true);
          },
        }}
      />

      {products.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyEmoji}>📭</Text>
          <Text style={styles.emptyText}>No hay productos</Text>
          <Button
            label="Agregar Primer Producto"
            onPress={() => setShowAddModal(true)}
            style={styles.emptyButton}
          />
        </View>
      ) : (
        <FlatList
          data={products}
          renderItem={renderProduct}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
        />
      )}

      {/* Modal Agregar/Editar Producto */}
      <Modal visible={showAddModal} onClose={() => setShowAddModal(false)}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>
            {selectedProduct ? 'Editar Producto' : 'Nuevo Producto'}
          </Text>

          <Input
            label="Nombre *"
            placeholder="Nombre del producto"
            value={formData.nombre}
            onChangeText={(v) => setFormData({ ...formData, nombre: v })}
          />

          <Input
            label="Código/SKU"
            placeholder="SKU o código de barras"
            value={formData.codigo}
            onChangeText={(v) => setFormData({ ...formData, codigo: v })}
          />

          <View style={styles.twoColumns}>
            <View style={styles.column}>
              <Input
                label="Precio Compra"
                placeholder="0.00"
                value={formData.precio_compra}
                onChangeText={(v) => setFormData({ ...formData, precio_compra: v })}
                keyboardType="numeric"
              />
            </View>
            <View style={styles.column}>
              <Input
                label="Precio Venta"
                placeholder="0.00"
                value={formData.precio_venta}
                onChangeText={(v) => setFormData({ ...formData, precio_venta: v })}
                keyboardType="numeric"
              />
            </View>
          </View>

          <View style={styles.twoColumns}>
            <View style={styles.column}>
              <Input
                label="Stock Actual"
                placeholder="0"
                value={formData.stock_actual}
                onChangeText={(v) => setFormData({ ...formData, stock_actual: v })}
                keyboardType="numeric"
              />
            </View>
            <View style={styles.column}>
              <Input
                label="Stock Mínimo"
                placeholder="0"
                value={formData.stock_minimo}
                onChangeText={(v) => setFormData({ ...formData, stock_minimo: v })}
                keyboardType="numeric"
              />
            </View>
          </View>

          <Button
            label="Guardar Producto"
            onPress={handleSaveProduct}
            fullWidth
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
  productCard: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  productHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.black,
    marginBottom: spacing.sm,
  },
  productCode: {
    fontSize: 12,
    color: colors.gray[600],
  },
  productPrice: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primary,
  },
  productStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: colors.gray[50],
    borderRadius: 8,
    paddingVertical: spacing.md,
    marginBottom: spacing.md,
  },
  stat: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: colors.gray[600],
    marginBottom: spacing.sm,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.black,
  },
  statWarning: {
    color: colors.warning,
  },
  productActions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  actionButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: 6,
    alignItems: 'center',
  },
  editButton: {
    backgroundColor: colors.primary + '20',
  },
  deleteButton: {
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
  twoColumns: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  column: {
    flex: 1,
  },
  saveButton: {
    marginVertical: spacing.lg,
  },
});
