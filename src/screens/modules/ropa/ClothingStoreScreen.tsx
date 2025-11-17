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
} from 'react-native';
import { Header, Button, Card, Input, Loading } from '@components/common';
import { colors, spacing, typography } from '@theme/index';
import { useBusiness } from '@hooks/useBusiness';
import { supabase } from '@services/supabase/client';
import type { ClothingProduct } from '@types/clothing';

export default function ClothingStoreScreen() {
  const { business } = useBusiness();
  const [products, setProducts] = useState<ClothingProduct[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ClothingProduct | null>(
    null
  );
  const [showProductModal, setShowProductModal] = useState(false);
  const [filterTipo, setFilterTipo] = useState<string>('TODOS');

  useEffect(() => {
    loadClothingProducts();
  }, [business]);

  const loadClothingProducts = async () => {
    if (!business) return;
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('clothing_products')
        .select('*')
        .eq('negocio_id', business.id)
        .eq('activo', true);

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredProducts = products.filter((p) =>
    filterTipo === 'TODOS' ? true : p.tipo === filterTipo
  );

  const renderProductCard = ({ item }: { item: ClothingProduct }) => (
    <TouchableOpacity
      style={styles.productCard}
      onPress={() => {
        setSelectedProduct(item);
        setShowProductModal(true);
      }}
    >
      <Image
        source={{ uri: item.imagen_plana }}
        style={styles.productImage}
      />
      <View style={styles.productInfo}>
        <Text style={styles.productName} numberOfLines={2}>
          {item.nombre}
        </Text>
        <Text style={styles.productType}>{item.tipo}</Text>
        <View style={styles.priceRow}>
          <Text style={styles.price}>S/ {item.precio_venta.toFixed(2)}</Text>
          <View style={styles.stockInfo}>
            <Text style={styles.stockBadge}>
              {Object.values(item.stock_por_talla_color)
                .reduce((sum, tallas) => sum + Object.values(tallas).reduce((a, b) => a + b, 0), 0)} en stock
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (isLoading) return <Loading fullScreen />;

  return (
    <View style={styles.container}>
      <Header
        title="👕 Tienda de Ropa"
        subtitle={`${products.length} productos`}
      />

      <View style={styles.filterContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterScroll}
        >
          {['TODOS', 'ROPA', 'CALZADO', 'ACCESORIO'].map((tipo) => (
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

      <FlatList
        data={filteredProducts}
        renderItem={renderProductCard}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.columnWrapper}
        contentContainerStyle={styles.listContent}
      />

      {/* Modal Detalle del Producto */}
      <Modal
        visible={showProductModal}
        animationType="slide"
        onRequestClose={() => setShowProductModal(false)}
      >
        {selectedProduct && (
          <ClothingProductDetail
            product={selectedProduct}
            onClose={() => setShowProductModal(false)}
          />
        )}
      </Modal>
    </View>
  );
}

interface ClothingProductDetailProps {
  product: ClothingProduct;
  onClose: () => void;
}

const ClothingProductDetail: React.FC<ClothingProductDetailProps> = ({
  product,
  onClose,
}) => {
  const [selectedTalla, setSelectedTalla] = useState(product.tallas[0]);
  const [selectedColor, setSelectedColor] = useState(product.colores[0]?.nombre);
  const [showARTryOn, setShowARTryOn] = useState(false);

  return (
    <View style={styles.detailContainer}>
      <View style={styles.detailHeader}>
        <TouchableOpacity onPress={onClose}>
          <Text style={styles.closeButton}>← Atrás</Text>
        </TouchableOpacity>
        <Text style={styles.detailTitle}>{product.nombre}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.detailContent} showsVerticalScrollIndicator={false}>
        {/* Galería de Imágenes */}
        <View style={styles.imageGallery}>
          <Image
            source={{ uri: product.imagen_plana }}
            style={styles.mainImage}
          />
        </View>

        {/* Información Básica */}
        <Card style={styles.infoCard}>
          <Text style={styles.productPrice}>S/ {product.precio_venta.toFixed(2)}</Text>
          <Text style={styles.productDescription}>{product.descripcion}</Text>

          {product.material && (
            <Text style={styles.detail}>📌 Material: {product.material}</Text>
          )}
          {product.temporada && (
            <Text style={styles.detail}>🌡️ Temporada: {product.temporada}</Text>
          )}
        </Card>

        {/* Selector de Talla */}
        <Card>
          <Text style={styles.sectionTitle}>Seleccionar Talla</Text>
          <View style={styles.tallaGrid}>
            {product.tallas.map((talla) => (
              <TouchableOpacity
                key={talla}
                style={[
                  styles.tallaButton,
                  selectedTalla === talla && styles.tallaButtonSelected,
                ]}
                onPress={() => setSelectedTalla(talla)}
              >
                <Text
                  style={[
                    styles.tallaText,
                    selectedTalla === talla && styles.tallaTextSelected,
                  ]}
                >
                  {talla}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Card>

        {/* Selector de Color */}
        <Card>
          <Text style={styles.sectionTitle}>Seleccionar Color</Text>
          <View style={styles.colorGrid}>
            {product.colores.map((color) => (
              <TouchableOpacity
                key={color.nombre}
                style={[
                  styles.colorOption,
                  selectedColor === color.nombre &&
                    styles.colorOptionSelected,
                ]}
                onPress={() => setSelectedColor(color.nombre)}
              >
                <View
                  style={[
                    styles.colorCircle,
                    { backgroundColor: color.codigo_hex },
                  ]}
                />
                <Text style={styles.colorName}>{color.nombre}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Card>

        {/* Probador Virtual AR */}
        <Card>
          <Button
            label="📷 Probador Virtual (AR)"
            onPress={() => setShowARTryOn(true)}
            fullWidth
            variant="secondary"
            style={styles.arButton}
          />
          <Text style={styles.arInfo}>
            📌 Usa tu cámara para probarte la ropa en tiempo real
          </Text>
        </Card>

        {/* Detalles Adicionales */}
        {product.cuidados && (
          <Card>
            <Text style={styles.sectionTitle}>Instrucciones de Cuidado</Text>
            <Text style={styles.detail}>{product.cuidados}</Text>
          </Card>
        )}
      </ScrollView>

      <View style={styles.actionButtons}>
        <Button
          label="🛒 Agregar al Carrito"
          onPress={onClose}
          fullWidth
        />
      </View>

      {/* Modal Probador AR */}
      {showARTryOn && (
        <VirtualTryOnAR
          product={product}
          talla={selectedTalla}
          color={selectedColor}
          onClose={() => setShowARTryOn(false)}
        />
      )}
    </View>
  );
};

interface VirtualTryOnARProps {
  product: ClothingProduct;
  talla: string;
  color: string;
  onClose: () => void;
}

const VirtualTryOnAR: React.FC<VirtualTryOnARProps> = ({
  product,
  talla,
  color,
  onClose,
}) => {
  return (
    <Modal
      visible={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.arContainer}>
        <View style={styles.arHeader}>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.arCloseButton}>← Cerrar</Text>
          </TouchableOpacity>
          <Text style={styles.arTitle}>Probador Virtual</Text>
          <TouchableOpacity>
            <Text style={styles.arCapture}>📸</Text>
          </TouchableOpacity>
        </View>

        {/* Aquí iría la cámara AR */}
        <View style={styles.arPreview}>
          <View style={styles.cameraPlaceholder}>
            <Text style={styles.placeholderText}>
              📷 Cámara AR
            </Text>
            <Text style={styles.placeholderSubtext}>
              {product.nombre}
            </Text>
            <Text style={styles.placeholderSubtext}>
              Talla: {talla} | Color: {color}
            </Text>
          </View>
        </View>

        <View style={styles.arControls}>
          <Button
            label="Girar"
            onPress={() => {}}
            variant="ghost"
            size="sm"
          />
          <Button
            label="Zoom"
            onPress={() => {}}
            variant="ghost"
            size="sm"
          />
          <Button
            label="Capturar"
            onPress={() => {}}
            size="sm"
          />
        </View>

        <View style={styles.arInfo}>
          <Text style={styles.arInfoText}>
            💡 Tip: Mueve tu dispositivo para ver la prenda desde diferentes ángulos
          </Text>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  filterContainer: {
    paddingVertical: spacing.md,
    backgroundColor: colors.gray[50],
  },
  filterScroll: {
    paddingHorizontal: spacing.lg,
  },
  filterButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    backgroundColor: colors.white,
    marginRight: spacing.md,
    borderWidth: 1,
    borderColor: colors.gray[300],
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
  listContent: {
    padding: spacing.md,
  },
  columnWrapper: {
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  productCard: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  productImage: {
    width: '100%',
    height: 180,
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
  productType: {
    fontSize: 11,
    color: colors.gray[600],
    marginBottom: spacing.md,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  price: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
  },
  stockInfo: {
    backgroundColor: colors.success + '20',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: 4,
  },
  stockBadge: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.success,
  },
  detailContainer: {
    flex: 1,
    backgroundColor: colors.white,
  },
  detailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  closeButton: {
    color: colors.primary,
    fontWeight: '600',
    fontSize: 14,
  },
  detailTitle: {
    ...typography.h4,
    color: colors.black,
  },
  detailContent: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  imageGallery: {
    marginBottom: spacing.lg,
  },
  mainImage: {
    width: '100%',
    height: 300,
    backgroundColor: colors.gray[100],
    borderRadius: 12,
  },
  infoCard: {
    marginBottom: spacing.lg,
  },
  productPrice: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: spacing.md,
  },
  productDescription: {
    fontSize: 14,
    color: colors.gray[700],
    marginBottom: spacing.md,
    lineHeight: 20,
  },
  detail: {
    fontSize: 13,
    color: colors.gray[700],
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.black,
    marginBottom: spacing.md,
  },
  tallaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  tallaButton: {
    flex: 1,
    minWidth: '22%',
    paddingVertical: spacing.md,
    borderRadius: 8,
    backgroundColor: colors.gray[100],
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  tallaButtonSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  tallaText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.black,
  },
  tallaTextSelected: {
    color: colors.white,
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  colorOption: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  colorOptionSelected: {
    opacity: 0.8,
  },
  colorCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 3,
    borderColor: colors.gray[300],
  },
  colorName: {
    fontSize: 12,
    color: colors.black,
    fontWeight: '600',
  },
  arButton: {
    marginBottom: spacing.md,
  },
  arInfo: {
    backgroundColor: colors.info + '15',
    padding: spacing.md,
    borderRadius: 8,
    marginTop: spacing.md,
  },
  arInfoText: {
    fontSize: 12,
    color: colors.info,
    fontWeight: '500',
  },
  actionButtons: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.gray[200],
    backgroundColor: colors.white,
  },
  arContainer: {
    flex: 1,
    backgroundColor: colors.black,
  },
  arHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    backgroundColor: colors.black,
  },
  arCloseButton: {
    color: colors.white,
    fontWeight: '700',
    fontSize: 14,
  },
  arTitle: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
  arCapture: {
    fontSize: 20,
  },
  arPreview: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.black,
  },
  cameraPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: colors.white,
    fontSize: 24,
    fontWeight: '700',
    marginBottom: spacing.md,
  },
  placeholderSubtext: {
    color: colors.gray[400],
    fontSize: 14,
    marginVertical: spacing.sm,
  },
  arControls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: spacing.lg,
    backgroundColor: colors.black,
    borderTopWidth: 1,
    borderTopColor: colors.gray[800],
  },
  arInfo: {
    backgroundColor: colors.gray[900],
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  arInfoText: {
    color: colors.gray[300],
    fontSize: 12,
    textAlign: 'center',
  },
});
