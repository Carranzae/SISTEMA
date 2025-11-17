import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Text,
  Alert,
  FlatList,
  TextInput,
  Modal,
} from 'react-native';
import { Header, Button, Card, Loading, Input } from '@components/common';
import { ActionButtons } from '@components/common/ActionButtons';
import { PermissionGate } from '@components/common/PermissionGate';
import { colors, spacing, typography } from '@theme/index';
import { useBusiness } from '@hooks/useBusiness';
import { useAuthStore } from '@store/auth.store';
import { notificationService } from '@services/notifications/notification.service';
import { supabase } from '@services/supabase/client';

interface Producto {
  id: string;
  nombre: string;
  codigo: string;
  precio_venta: number;
  stock_actual: number;
  stock_minimo: number;
  categoria: string;
  proveedor?: string;
}

export default function InventoryScreenV2() {
  const { business } = useBusiness();
  const { user: currentUser } = useAuthStore();

  const [productos, setProductos] = useState<Producto[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProducto, setSelectedProducto] = useState<Producto | null>(null);
  const [filterCategoria, setFilterCategoria] = useState('TODOS');

  const [formData, setFormData] = useState({
    nombre: '',
    codigo: '',
    precio_venta: '',
    stock_actual: '',
    stock_minimo: '',
    categoria: '',
    proveedor: '',
  });

  useEffect(() => {
    loadProductos();
  }, [business]);

  const loadProductos = async () => {
    if (!business) return;
    setIsLoading(true);
    try {
      // Simulación de datos
      const mockProductos: Producto[] = [
        {
          id: '1',
          nombre: 'Camiseta Premium Azul',
          codigo: 'CAM-001',
          precio_venta: 49.99,
          stock_actual: 25,
          stock_minimo: 10,
          categoria: 'ROPA',
          proveedor: 'Textiles Perú',
        },
        {
          id: '2',
          nombre: 'Pantalón Slim Negro',
          codigo: 'PAN-001',
          precio_venta: 79.99,
          stock_actual: 5,
          stock_minimo: 10,
          categoria: 'ROPA',
          proveedor: 'Textiles Perú',
        },
        {
          id: '3',
          nombre: 'Zapatos Deportivos',
          codigo: 'ZAP-001',
          precio_venta: 99.99,
          stock_actual: 12,
          stock_minimo: 5,
          categoria: 'CALZADO',
          proveedor: 'Calzados Perú',
        },
      ];

      setProductos(mockProductos);

      // Notificar stock bajo
      mockProductos.forEach((p) => {
        if (p.stock_actual < p.stock_minimo && currentUser && business) {
          notificationService.notifyLowStock(
            business.id,
            currentUser.id,
            p.nombre,
            p.stock_actual
          );
        }
      });
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddProducto = async () => {
    if (
      !formData.nombre.trim() ||
      !formData.precio_venta.trim() ||
      !business ||
      !currentUser
    ) {
      Alert.alert('Error', 'Completa todos los campos requeridos');
      return;
    }

    setIsLoading(true);
    try {
      const newProducto: Producto = {
        id: Date.now().toString(),
        nombre: formData.nombre,
        codigo: formData.codigo,
        precio_venta: parseFloat(formData.precio_venta),
        stock_actual: parseInt(formData.stock_actual) || 0,
        stock_minimo: parseInt(formData.stock_minimo) || 0,
        categoria: formData.categoria,
        proveedor: formData.proveedor,
      };

      setProductos([newProducto, ...productos]);

      // Notificar
      await notificationService.createNotification(
        currentUser.id,
        business.id,
        'MODIFICACION_MASIVA',
        '➕ Producto Agregado',
        `Se agregó el producto: ${formData.nombre}`,
        { producto: formData.nombre },
        'push'
      );

      resetForm();
      setShowAddModal(false);
      Alert.alert('✅ Éxito', 'Producto agregado correctamente');
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditProducto = async (productoId: string) => {
    const producto = productos.find((p) => p.id === productoId);
    if (!producto) return;

    setSelectedProducto(producto);
    setFormData({
      nombre: producto.nombre,
      codigo: producto.codigo,
      precio_venta: producto.precio_venta.toString(),
      stock_actual: producto.stock_actual.toString(),
      stock_minimo: producto.stock_minimo.toString(),
      categoria: producto.categoria,
      proveedor: producto.proveedor || '',
    });
    setShowAddModal(true);
  };

  const handleDeleteProducto = async (productoId: string) => {
    const producto = productos.find((p) => p.id === productoId);
    if (!producto) return;

    Alert.alert(
      '⚠️ Eliminar Producto',
      `¿Eliminar "${producto.nombre}"?\n\nEsta acción no se puede deshacer.`,
      [
        { text: 'Cancelar' },
        {
          text: 'Eliminar',
          onPress: async () => {
            try {
              setProductos(productos.filter((p) => p.id !== productoId));

              if (currentUser && business) {
                await notificationService.createNotification(
                  currentUser.id,
                  business.id,
                  'MODIFICACION_MASIVA',
                  '🗑️ Producto Eliminado',
                  `Se eliminó: ${producto.nombre}`,
                  { producto: producto.nombre },
                  'push'
                );
              }

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

  const handleDuplicateProducto = (productoId: string) => {
    const producto = productos.find((p) => p.id === productoId);
    if (!producto) return;

    const duplicado: Producto = {
      ...producto,
      id: Date.now().toString(),
      nombre: `${producto.nombre} (Copia)`,
      codigo: `${producto.codigo}-COPY`,
    };

    setProductos([duplicado, ...productos]);
    Alert.alert('✅ Éxito', 'Producto duplicado');
  };

  const handleExportProducto = (productoId: string) => {
    const producto = productos.find((p) => p.id === productoId);
    if (!producto) return;

    const csvData = `Nombre,Código,Precio,Stock,Categoría\n${producto.nombre},${producto.codigo},${producto.precio_venta},${producto.stock_actual},${producto.categoria}`;
    
    Alert.alert('✅ Exportado', 'Producto exportado como CSV');
  };

  const resetForm = () => {
    setFormData({
      nombre: '',
      codigo: '',
      precio_venta: '',
      stock_actual: '',
      stock_minimo: '',
      categoria: '',
      proveedor: '',
    });
    setSelectedProducto(null);
  };

  const filteredProductos = productos.filter((p) => {
    const matchSearch = p.nombre
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchFilter =
      filterCategoria === 'TODOS' || p.categoria === filterCategoria;
    return matchSearch && matchFilter;
  });

  if (isLoading && productos.length === 0) return <Loading fullScreen />;

  const stockBajoCount = productos.filter(
    (p) => p.stock_actual < p.stock_minimo
  ).length;

  return (
    <View style={styles.container}>
      <Header
        title="📦 Inventario"
        subtitle={`${productos.length} productos`}
        rightAction={{
          label: '+ Nuevo',
          onPress: () => {
            resetForm();
            setShowAddModal(true);
          },
        }}
      />

      {/* Alertas */}
      {stockBajoCount > 0 && (
        <View style={styles.alertBar}>
          <Text style={styles.alertIcon}>⚠️</Text>
          <Text style={styles.alertText}>
            {stockBajoCount} producto(s) con stock bajo
          </Text>
        </View>
      )}

      {/* Search y Filtros */}
      <View style={styles.searchSection}>
        <TextInput
          style={styles.searchInput}
          placeholder="🔍 Buscar producto..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowFilterModal(true)}
        >
          <Text style={styles.filterIcon}>⚙️</Text>
        </TouchableOpacity>
      </View>

      {/* Lista de Productos */}
      <FlatList
        data={filteredProductos}
        renderItem={({ item }) => (
          <PermissionGate modulo="inventario" accion="ver">
            <Card style={styles.productCard}>
              <View style={styles.productHeader}>
                <View style={styles.productInfo}>
                  <Text style={styles.productName}>{item.nombre}</Text>
                  <Text style={styles.productCode}>{item.codigo}</Text>
                  <Text style={styles.productCategory}>{item.categoria}</Text>
                </View>
                <View style={styles.productStats}>
                  <Text style={styles.price}>S/ {item.precio_venta}</Text>
                  <View
                    style={[
                      styles.stockBadge,
                      item.stock_actual < item.stock_minimo &&
                        styles.stockLow,
                    ]}
                  >
                    <Text style={styles.stockText}>{item.stock_actual}</Text>
                  </View>
                </View>
              </View>

              <View style={styles.stockInfo}>
                <Text style={styles.stockLabel}>Stock Mínimo: {item.stock_minimo}</Text>
                <View style={styles.stockBar}>
                  <View
                    style={[
                      styles.stockFill,
                      {
                        width: `${Math.min(
                          (item.stock_actual / item.stock_minimo) * 100,
                          100
                        )}%`,
                      },
                    ]}
                  />
                </View>
              </View>

              <PermissionGate modulo="inventario" accion="editar">
                <ActionButtons
                  onEdit={() => handleEditProducto(item.id)}
                  onDuplicate={() => handleDuplicateProducto(item.id)}
                  onExport={() => handleExportProducto(item.id)}
                  onDelete={() => handleDeleteProducto(item.id)}
                  style={styles.actions}
                />
              </PermissionGate>
            </Card>
          </PermissionGate>
        )}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        scrollEnabled={false}
        nestedScrollEnabled={false}
      />

      {/* Modal Agregar/Editar */}
      <Modal visible={showAddModal} animationType="slide">
        <ScrollView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowAddModal(false)}>
              <Text style={styles.modalCloseButton}>✕</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>
              {selectedProducto ? 'Editar Producto' : 'Nuevo Producto'}
            </Text>
            <View style={{ width: 30 }} />
          </View>

          <View style={styles.formContainer}>
            <Input
              label="Nombre *"
              placeholder="Nombre del producto"
              value={formData.nombre}
              onChangeText={(v) =>
                setFormData({ ...formData, nombre: v })
              }
            />

            <Input
              label="Código SKU"
              placeholder="SKU-001"
              value={formData.codigo}
              onChangeText={(v) =>
                setFormData({ ...formData, codigo: v })
              }
            />

            <Input
              label="Categoría"
              placeholder="ROPA, CALZADO, etc"
              value={formData.categoria}
              onChangeText={(v) =>
                setFormData({ ...formData, categoria: v })
              }
            />

            <Input
              label="Proveedor"
              placeholder="Nombre del proveedor"
              value={formData.proveedor}
              onChangeText={(v) =>
                setFormData({ ...formData, proveedor: v })
              }
            />

            <View style={styles.twoColumns}>
              <View style={styles.column}>
                <Input
                  label="Precio Venta *"
                  placeholder="0.00"
                  value={formData.precio_venta}
                  onChangeText={(v) =>
                    setFormData({ ...formData, precio_venta: v })
                  }
                  keyboardType="decimal-pad"
                />
              </View>
              <View style={styles.column}>
                <Input
                  label="Stock Actual"
                  placeholder="0"
                  value={formData.stock_actual}
                  onChangeText={(v) =>
                    setFormData({ ...formData, stock_actual: v })
                  }
                  keyboardType="numeric"
                />
              </View>
            </View>

            <Input
              label="Stock Mínimo"
              placeholder="0"
              value={formData.stock_minimo}
              onChangeText={(v) =>
                setFormData({ ...formData, stock_minimo: v })
              }
              keyboardType="numeric"
            />

            <Button
              label={selectedProducto ? '✏️ Actualizar' : '➕ Agregar'}
              onPress={handleAddProducto}
              fullWidth
              loading={isLoading}
              style={styles.submitButton}
            />

            <Button
              label="Cancelar"
              onPress={() => setShowAddModal(false)}
              variant="ghost"
              fullWidth
            />
          </View>
        </ScrollView>
      </Modal>

      {/* Modal Filtros */}
      <Modal visible={showFilterModal} animationType="slide">
        <View style={styles.filterModalContainer}>
          <View style={styles.filterModalHeader}>
            <TouchableOpacity onPress={() => setShowFilterModal(false)}>
              <Text style={styles.modalCloseButton}>✕</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Filtros</Text>
            <View style={{ width: 30 }} />
          </View>

          <ScrollView style={styles.formContainer}>
            <Text style={styles.filterLabel}>Categoría</Text>
            {['TODOS', 'ROPA', 'CALZADO', 'ACCESORIOS'].map((cat) => (
              <TouchableOpacity
                key={cat}
                style={[
                  styles.filterOption,
                  filterCategoria === cat && styles.filterOptionSelected,
                ]}
                onPress={() => {
                  setFilterCategoria(cat);
                  setShowFilterModal(false);
                }}
              >
                <Text
                  style={[
                    styles.filterOptionText,
                    filterCategoria === cat &&
                      styles.filterOptionTextSelected,
                  ]}
                >
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
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
  alertBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.warning + '15',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: colors.warning,
  },
  alertIcon: {
    fontSize: 20,
  },
  alertText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.warning,
  },
  searchSection: {
    flexDirection: 'row',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  searchInput: {
    flex: 1,
    backgroundColor: colors.gray[100],
    borderRadius: 8,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    fontSize: 14,
    borderWidth: 1,
    borderColor: colors.gray[300],
  },
  filterButton: {
    backgroundColor: colors.gray[100],
    borderRadius: 8,
    paddingHorizontal: spacing.lg,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.gray[300],
  },
  filterIcon: {
    fontSize: 18,
  },
  listContent: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  productCard: {
    borderRadius: 12,
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
    fontSize: 15,
    fontWeight: '700',
    color: colors.black,
    marginBottom: spacing.sm,
  },
  productCode: {
    fontSize: 12,
    color: colors.gray[600],
    marginBottom: spacing.xs,
  },
  productCategory: {
    fontSize: 11,
    color: colors.primary,
    fontWeight: '600',
  },
  productStats: {
    alignItems: 'flex-end',
    gap: spacing.sm,
  },
  price: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary,
  },
  stockBadge: {
    backgroundColor: colors.success + '20',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 6,
  },
  stockLow: {
    backgroundColor: colors.warning + '20',
  },
  stockText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.success,
  },
  stockInfo: {
    marginBottom: spacing.lg,
  },
  stockLabel: {
    fontSize: 11,
    color: colors.gray[600],
    marginBottom: spacing.sm,
  },
  stockBar: {
    height: 6,
    backgroundColor: colors.gray[200],
    borderRadius: 3,
    overflow: 'hidden',
  },
  stockFill: {
    height: '100%',
    backgroundColor: colors.success,
  },
  actions: {
    marginTop: spacing.md,
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
  modalCloseButton: {
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
  twoColumns: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  column: {
    flex: 1,
  },
  submitButton: {
    marginVertical: spacing.lg,
  },
  filterModalContainer: {
    flex: 1,
    backgroundColor: colors.white,
  },
  filterModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.black,
    marginBottom: spacing.md,
  },
  filterOption: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    marginBottom: spacing.sm,
    borderRadius: 8,
    backgroundColor: colors.gray[50],
    borderWidth: 2,
    borderColor: 'transparent',
  },
  filterOptionSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterOptionText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.black,
    textAlign: 'center',
  },
  filterOptionTextSelected: {
    color: colors.white,
  },
});
