import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Text,
  FlatList,
  Image,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import { Header, Button, Card, Loading } from '@components/common';
import { colors, spacing, typography } from '@theme/index';
import { useBusiness } from '@hooks/useBusiness';
import { useAuthStore } from '@store/auth.store';
import { usersAdvancedService } from '@services/supabase/users-advanced.service';
import { notificationService } from '@services/notifications/notification.service';
import { supabase } from '@services/supabase/client';

interface Producto {
  id: string;
  nombre: string;
  precio: number;
  stock: number;
  imagen: string;
  tallas: string[];
  colores: { nombre: string; codigo: string }[];
  tipo: 'top' | 'bottom' | 'dress' | 'shoes' | 'accessories';
}

export default function ClothingStoreScreenV2() {
  const { business } = useBusiness();
  const { user: currentUser } = useAuthStore();

  const [productos, setProductos] = useState<Producto[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);
  const [activeTab, setActiveTab] = useState<'productos' | 'vendidos' | 'marketplace'>('productos');
  const [showProductModal, setShowProductModal] = useState(false);
  const [selectedProducto, setSelectedProducto] = useState<Producto | null>(null);

  const [filterTipo, setFilterTipo] = useState('TODOS');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    checkPermissions();
    loadProductos();
  }, [business]);

  const checkPermissions = async () => {
    if (!currentUser) return;
    const hasAccess = await usersAdvancedService.hasPermission(
      currentUser.id,
      'ropa',
      'ver'
    );
    setHasPermission(hasAccess);
  };

  const loadProductos = async () => {
    setIsLoading(true);
    // Simulación de datos
    const mockProductos: Producto[] = [
      {
        id: '1',
        nombre: 'Camiseta Premium',
        precio: 49.99,
        stock: 25,
        imagen: 'https://via.placeholder.com/200',
        tallas: ['XS', 'S', 'M', 'L', 'XL'],
        colores: [
          { nombre: 'Blanco', codigo: '#FFFFFF' },
          { nombre: 'Negro', codigo: '#000000' },
        ],
        tipo: 'top',
      },
      {
        id: '2',
        nombre: 'Pantalón Slim',
        precio: 79.99,
        stock: 15,
        imagen: 'https://via.placeholder.com/200',
        tallas: ['28', '30', '32', '34', '36'],
        colores: [{ nombre: 'Azul', codigo: '#0000FF' }],
        tipo: 'bottom',
      },
      {
        id: '3',
        nombre: 'Vestido Elegante',
        precio: 129.99,
        stock: 8,
        imagen: 'https://via.placeholder.com/200',
        tallas: ['S', 'M', 'L', 'XL'],
        colores: [{ nombre: 'Rojo', codigo: '#FF0000' }],
        tipo: 'dress',
      },
      {
        id: '4',
        nombre: 'Zapatillas Deportivas',
        precio: 99.99,
        stock: 12,
        imagen: 'https://via.placeholder.com/200',
        tallas: ['36', '37', '38', '39', '40', '41', '42'],
        colores: [{ nombre: 'Gris', codigo: '#808080' }],
        tipo: 'shoes',
      },
    ];
    setProductos(mockProductos);
    setIsLoading(false);
  };

  const filteredProductos = productos.filter((p) => {
    const matchTipo = filterTipo === 'TODOS' || p.tipo === filterTipo.toLowerCase();
    const matchSearch = p.nombre.toLowerCase().includes(searchQuery.toLowerCase());
    return matchTipo && matchSearch;
  });

  const handleDeleteProducto = async (productoId: string) => {
    Alert.alert(
      'Eliminar Producto',
      '¿Eliminar este producto del catálogo?',
      [
        { text: 'Cancelar' },
        {
          text: 'Eliminar',
          onPress: async () => {
            try {
              // Aquí iría la llamada a la API
              setProductos(productos.filter((p) => p.id !== productoId));

              // Notificar
              if (currentUser && business) {
                await notificationService.createNotification(
                  currentUser.id,
                  business.id,
                  'MODIFICACION_MASIVA',
                  '🗑️ Producto Eliminado',
                  'Se eliminó un producto del catálogo',
                  { productoId },
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

  if (!hasPermission) {
    return (
      <View style={styles.container}>
        <Header title="👕 Tienda de Ropa" subtitle="Sin permisos" />
        <View style={styles.noPermission}>
          <Text style={styles.noPermissionEmoji}>🔒</Text>
          <Text style={styles.noPermissionText}>
            No tienes permisos para acceder a este módulo
          </Text>
        </View>
      </View>
    );
  }

  if (isLoading) return <Loading fullScreen />;

  return (
    <View style={styles.container}>
      <Header
        title="👕 Tienda de Ropa"
        subtitle={`${productos.length} productos`}
      />

      {/* Tabs */}
      <View style={styles.tabContainer}>
        {(['productos', 'vendidos', 'marketplace'] as const).map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[
              styles.tab,
              activeTab === tab && styles.tabActive,
            ]}
            onPress={() => setActiveTab(tab)}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === tab && styles.tabTextActive,
              ]}
            >
              {tab === 'productos' && '📦 Productos'}
              {tab === 'vendidos' && '💼 Vendidos'}
              {tab === 'marketplace' && '🛒 Marketplace'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {activeTab === 'productos' && (
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Search */}
          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="🔍 Buscar producto..."
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          {/* Filtros */}
          <View style={styles.filterContainer}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.filterScroll}
            >
              {['TODOS', 'TOP', 'BOTTOM', 'DRESS', 'SHOES'].map((tipo) => (
                <TouchableOpacity
                  key={tipo}
                  style={[
                    styles.filterButton,
                    filterTipo === tipo && styles.filterButtonActive,
                  ]}
                  onPress={() => setFilterTipo(tipo)}
                >
                  <Text
                    style={[
                      styles.filterText,
                      filterTipo === tipo && styles.filterTextActive,
                    ]}
                  >
                    {tipo}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Grid de Productos */}
          <View style={styles.gridContainer}>
            {filteredProductos.map((producto) => (
              <TouchableOpacity
                key={producto.id}
                style={styles.productCard}
                onPress={() => {
                  setSelectedProducto(producto);
                  setShowProductModal(true);
                }}
              >
                <Image
                  source={{ uri: producto.imagen }}
                  style={styles.productImage}
                />
                <View style={styles.productInfo}>
                  <Text style={styles.productName} numberOfLines={2}>
                    {producto.nombre}
                  </Text>
                  <View style={styles.productStats}>
                    <Text style={styles.productPrice}>S/ {producto.precio}</Text>
                    <View
                      style={[
                        styles.stockBadge,
                        producto.stock < 10 && styles.stockLow,
                      ]}
                    >
                      <Text style={styles.stockText}>{producto.stock}</Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      )}

      {activeTab === 'marketplace' && (
        <View style={styles.content}>
          <Card style={styles.marketplaceCard}>
            <Text style={styles.marketplaceTitle}>🛒 Crear Enlace Público</Text>
            <Button
              label="Ir a Publicación de Marketplace"
              onPress={() => Alert.alert('Abre pantalla de marketplace')}
              fullWidth
            />
          </Card>
        </View>
      )}

      {/* Modal Producto */}
      <Modal
        visible={showProductModal && !!selectedProducto}
        animationType="slide"
        onRequestClose={() => setShowProductModal(false)}
      >
        {selectedProducto && (
          <ScrollView style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setShowProductModal(false)}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
              <Text style={styles.modalTitle2}>{selectedProducto.nombre}</Text>
              <View style={{ width: 30 }} />
            </View>

            <Image
              source={{ uri: selectedProducto.imagen }}
              style={styles.modalImage}
            />

            <Card style={styles.modalCard}>
              <Text style={styles.priceLabel}>Precio</Text>
              <Text style={styles.price}>S/ {selectedProducto.precio}</Text>

              <Text style={[styles.priceLabel, { marginTop: spacing.lg }]}>
                Stock Disponible
              </Text>
              <Text style={styles.price}>{selectedProducto.stock} unidades</Text>

              <Text style={[styles.priceLabel, { marginTop: spacing.lg }]}>
                Tallas
              </Text>
              <View style={styles.tallaGrid}>
                {selectedProducto.tallas.map((talla) => (
                  <View key={talla} style={styles.tallaBadge}>
                    <Text style={styles.tallaText}>{talla}</Text>
                  </View>
                ))}
              </View>

              <Text style={[styles.priceLabel, { marginTop: spacing.lg }]}>
                Colores
              </Text>
              <View style={styles.colorGrid}>
                {selectedProducto.colores.map((color) => (
                  <View
                    key={color.nombre}
                    style={styles.colorItem}
                  >
                    <View
                      style={[
                        styles.colorCircle,
                        { backgroundColor: color.codigo },
                      ]}
                    />
                    <Text style={styles.colorName}>{color.nombre}</Text>
                  </View>
                ))}
              </View>

              <View style={styles.modalActions}>
                <Button
                  label="🗑️ Eliminar"
                  onPress={() => {
                    handleDeleteProducto(selectedProducto.id);
                    setShowProductModal(false);
                  }}
                  variant="danger"
                  fullWidth
                  style={styles.deleteButtonModal}
                />
                <Button
                  label="✏️ Editar"
                  onPress={() => Alert.alert('Editar producto')}
                  fullWidth
                />
              </View>
            </Card>
          </ScrollView>
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
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: colors.gray[50],
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.md,
    alignItems: 'center',
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: colors.primary,
  },
  tabText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.gray[600],
  },
  tabTextActive: {
    color: colors.primary,
  },
  content: {
    flex: 1,
    padding: spacing.lg,
  },
  searchContainer: {
    marginBottom: spacing.lg,
  },
  searchInput: {
    backgroundColor: colors.gray[100],
    borderRadius: 8,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    fontSize: 14,
    borderWidth: 1,
    borderColor: colors.gray[300],
  },
  filterContainer: {
    marginBottom: spacing.lg,
  },
  filterScroll: {
    gap: spacing.md,
  },
  filterButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: colors.gray[300],
    marginRight: spacing.md,
  },
  filterButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.gray[700],
  },
  filterTextActive: {
    color: colors.white,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    justifyContent: 'space-between',
  },
  productCard: {
    width: '48%',
    backgroundColor: colors.white,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.gray[200],
  },
  productImage: {
    width: '100%',
    height: 150,
    backgroundColor: colors.gray[100],
  },
  productInfo: {
    padding: spacing.md,
  },
  productName: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.black,
    marginBottom: spacing.sm,
  },
  productStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  productPrice: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
  },
  stockBadge: {
    backgroundColor: colors.success + '20',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: 4,
  },
  stockLow: {
    backgroundColor: colors.warning + '20',
  },
  stockText: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.success,
  },
  noPermission: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noPermissionEmoji: {
    fontSize: 64,
    marginBottom: spacing.lg,
  },
  noPermissionText: {
    fontSize: 16,
    color: colors.gray[600],
    textAlign: 'center',
  },
  marketplaceCard: {
    marginTop: spacing.xl,
  },
  marketplaceTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.black,
    marginBottom: spacing.lg,
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
    color: colors.primary,
    fontWeight: '700',
  },
  modalTitle2: {
    ...typography.h4,
    color: colors.black,
  },
  modalImage: {
    width: '100%',
    height: 300,
    backgroundColor: colors.gray[100],
  },
  modalCard: {
    margin: spacing.lg,
  },
  priceLabel: {
    fontSize: 12,
    color: colors.gray[600],
    marginBottom: spacing.sm,
  },
  price: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.primary,
  },
  tallaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  tallaBadge: {
    backgroundColor: colors.gray[100],
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 6,
  },
  tallaText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.black,
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.lg,
  },
  colorItem: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  colorCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: colors.gray[300],
  },
  colorName: {
    fontSize: 11,
    color: colors.black,
    fontWeight: '600',
  },
  modalActions: {
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  deleteButtonModal: {
    marginBottom: spacing.md,
  },
});
