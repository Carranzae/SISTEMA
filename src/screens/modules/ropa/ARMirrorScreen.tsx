import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  Alert,
  Dimensions,
  ScrollView,
  Image,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Header, Button, Card, Modal, Loading } from '@components/common';
import { colors, spacing, typography } from '@theme/index';
import { useBusiness } from '@hooks/useBusiness';

interface PrendaSeleccionada {
  id: string;
  nombre: string;
  tipo: 'top' | 'bottom' | 'full_body' | 'shoes' | 'accessories';
  color: string;
}

export default function ARMirrorScreen() {
  const { business } = useBusiness();
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<any>(null);

  const [prendaSeleccionada, setPrendaSeleccionada] = useState<PrendaSeleccionada | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPrendaSelector, setShowPrendaSelector] = useState(false);
  const [showSizeComparison, setShowSizeComparison] = useState(false);
  const [recommendedSize, setRecommendedSize] = useState<string | null>(null);
  const [sizeComparisons, setSizeComparisons] = useState<Record<string, string>>({});
  const [showAssistant, setShowAssistant] = useState(false);
  const [assistantTip, setAssistantTip] = useState('');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);

  const prendas: PrendaSeleccionada[] = [
    { id: '1', nombre: 'Camiseta', tipo: 'top', color: 'Azul' },
    { id: '2', nombre: 'Pantalón', tipo: 'bottom', color: 'Negro' },
    { id: '3', nombre: 'Vestido', tipo: 'full_body', color: 'Rojo' },
    { id: '4', nombre: 'Zapatos', tipo: 'shoes', color: 'Blanco' },
    { id: '5', nombre: 'Collar', tipo: 'accessories', color: 'Oro' },
  ];

  useEffect(() => {
    if (!permission?.granted) {
      requestPermission();
    }
  }, [permission]);

  const handleCapturAndProcess = async () => {
    if (!prendaSeleccionada || !cameraRef.current) return;

    setIsProcessing(true);
    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.7,
      });

      // Procesar imagen
      const formData = new FormData();
      formData.append('image', {
        uri: photo.uri,
        type: 'image/jpeg',
        name: 'mirror_capture.jpg',
      } as any);
      formData.append('product_id', prendaSeleccionada.id);
      formData.append('prenda_type', prendaSeleccionada.tipo);

      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/api/v1/ar/mirror/process`,
        {
          method: 'POST',
          body: formData,
        }
      );

      const result = await response.json();

      if (result.success) {
        setCapturedImage(result.image_base64);
        setRecommendedSize(result.recommended_size);
        
        // Asistente personal
        generateAssistantTip(
          prendaSeleccionada.tipo,
          result.recommended_size,
          result.measurements
        );
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo procesar la imagen');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCompareSizes = async () => {
    if (!capturedImage || !prendaSeleccionada) return;

    setIsProcessing(true);
    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/api/v1/ar/mirror/size-comparison`,
        {
          method: 'POST',
          body: JSON.stringify({
            image_base64: capturedImage,
            product_id: prendaSeleccionada.id,
            sizes: 'XS,S,M,L,XL,XXL',
          }),
          headers: { 'Content-Type': 'application/json' },
        }
      );

      const result = await response.json();
      if (result.success) {
        setSizeComparisons(result.comparisons);
        setShowSizeComparison(true);
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo comparar tallas');
    } finally {
      setIsProcessing(false);
    }
  };

  const generateAssistantTip = (type: string, size: string, measurements: any) => {
    const tips: Record<string, string> = {
      top: `Tu talla recomendada es ${size}. Para tops, asegúrate que los hombros calzuen bien.`,
      bottom: `Talla ${size} es perfecta para ti. Los pantalones deben llegar a tu tobillo.`,
      full_body: `${size} es tu talla ideal. Este vestido marcará bien tu cintura.`,
      shoes: `Número ${size} es lo tuyo. Los zapatos deben ser cómodos desde el primer día.`,
      accessories: `Este accesorio se verá perfecto contigo. ¡Combínalo con diferentes looks!`,
    };

    setAssistantTip(tips[type] || 'Pruébate esta prenda, ¡se ve increíble!');
  };

  if (!permission?.granted) {
    return (
      <View style={styles.container}>
        <Header title="📷 Espejo AR" subtitle="Probador Virtual" />
        <View style={styles.permissionContainer}>
          <Text style={styles.permissionText}>
            Se necesita acceso a la cámara
          </Text>
          <Button
            label="Permitir Cámara"
            onPress={requestPermission}
          />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {!capturedImage ? (
        <>
          <CameraView
            style={styles.camera}
            ref={cameraRef}
          >
            <View style={styles.cameraOverlay}>
              <View style={styles.mirrorFrame}>
                <Text style={styles.frameText}>📍 Párate aquí</Text>
              </View>
            </View>

            <View style={styles.cameraControls}>
              <TouchableOpacity
                style={styles.closeCameraButton}
                onPress={() => {}}
              >
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.captureButton}
                onPress={handleCapturAndProcess}
                disabled={isProcessing || !prendaSeleccionada}
              >
                <Text style={styles.captureIcon}>📸</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.selectClothingButton}
                onPress={() => setShowPrendaSelector(true)}
              >
                <Text style={styles.selectIcon}>👕</Text>
              </TouchableOpacity>
            </View>
          </CameraView>

          {/* Selector de Prenda */}
          {prendaSeleccionada && (
            <View style={styles.selectedPrenda}>
              <Text style={styles.selectedPrendaText}>
                {prendaSeleccionada.nombre} - {prendaSeleccionada.color}
              </Text>
            </View>
          )}
        </>
      ) : (
        <ScrollView style={styles.resultContainer}>
          {/* Imagen Capturada */}
          <Card style={styles.imageCard}>
            <Image
              source={{ uri: `data:image/jpeg;base64,${capturedImage}` }}
              style={styles.capturedImage}
            />
          </Card>

          {/* Recomendación de Talla */}
          {recommendedSize && (
            <Card style={styles.sizeRecommendation}>
              <Text style={styles.sizeRecommendationTitle}>
                Talla Recomendada
              </Text>
              <Text style={styles.sizeRecommendationValue}>
                {recommendedSize}
              </Text>
              <Text style={styles.sizeRecommendationSubtitle}>
                Basado en tus medidas corporales
              </Text>
            </Card>
          )}

          {/* Asistente Personal */}
          {assistantTip && (
            <Card style={styles.assistantCard}>
              <Text style={styles.assistantIcon}>🤖</Text>
              <Text style={styles.assistantTitle}>Recomendación Personal</Text>
              <Text style={styles.assistantTip}>{assistantTip}</Text>
            </Card>
          )}

          {/* Comparador de Tallas */}
          <Card>
            <Button
              label="📊 Comparar Tallas"
              onPress={handleCompareSizes}
              fullWidth
              loading={isProcessing}
              style={styles.actionButton}
            />
          </Card>

          {/* Acciones */}
          <View style={styles.actionButtons}>
            <Button
              label="🔄 Otra Prenda"
              onPress={() => setCapturedImage(null)}
              variant="secondary"
              fullWidth
              style={styles.actionButton}
            />
            <Button
              label="🛒 Agregar al Carrito"
              onPress={() => Alert.alert('Agregado', 'Prenda añadida al carrito')}
              fullWidth
            />
          </View>
        </ScrollView>
      )}

      {/* Modal Comparador */}
      <Modal
        visible={showSizeComparison}
        onClose={() => setShowSizeComparison(false)}
      >
        <ScrollView style={styles.comparisonContainer}>
          <Text style={styles.comparisonTitle}>Comparador de Tallas</Text>
          {Object.entries(sizeComparisons).map(([size, image]) => (
            <View key={size} style={styles.comparisonItem}>
              <Text style={styles.sizeLabel}>{size}</Text>
              <Image
                source={{ uri: `data:image/jpeg;base64,${image}` }}
                style={styles.comparisonImage}
              />
            </View>
          ))}
          <Button
            label="Cerrar"
            onPress={() => setShowSizeComparison(false)}
            fullWidth
          />
        </ScrollView>
      </Modal>

      {/* Modal Selector Prenda */}
      <Modal
        visible={showPrendaSelector}
        onClose={() => setShowPrendaSelector(false)}
      >
        <View style={styles.prendaSelector}>
          <Text style={styles.modalTitle}>Selecciona una Prenda</Text>
          <ScrollView>
            {prendas.map((prenda) => (
              <TouchableOpacity
                key={prenda.id}
                style={styles.prendaOption}
                onPress={() => {
                  setPrendaSeleccionada(prenda);
                  setShowPrendaSelector(false);
                }}
              >
                <Text style={styles.prendaEmoji}>
                  {prenda.tipo === 'top' && '👔'}
                  {prenda.tipo === 'bottom' && '👖'}
                  {prenda.tipo === 'full_body' && '👗'}
                  {prenda.tipo === 'shoes' && '👞'}
                  {prenda.tipo === 'accessories' && '✨'}
                </Text>
                <View style={styles.prendaInfo}>
                  <Text style={styles.prendaNombre}>{prenda.nombre}</Text>
                  <Text style={styles.prendaColor}>{prenda.color}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </Modal>

      {isProcessing && <Loading fullScreen />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.black,
  },
  camera: {
    flex: 1,
  },
  cameraOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mirrorFrame: {
    width: 200,
    height: 300,
    borderWidth: 3,
    borderColor: colors.primary,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  frameText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '700',
  },
  cameraControls: {
    position: 'absolute',
    bottom: spacing.lg,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  captureButton: {
    backgroundColor: colors.primary,
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureIcon: {
    fontSize: 32,
  },
  closeCameraButton: {
    backgroundColor: colors.error,
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButton: {
    color: colors.white,
    fontSize: 20,
  },
  selectClothingButton: {
    backgroundColor: colors.secondary,
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectIcon: {
    fontSize: 20,
  },
  selectedPrenda: {
    position: 'absolute',
    top: spacing.lg,
    left: 0,
    right: 0,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    marginHorizontal: spacing.lg,
    borderRadius: 8,
  },
  selectedPrendaText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  permissionText: {
    fontSize: 16,
    color: colors.gray[700],
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  resultContainer: {
    flex: 1,
    padding: spacing.lg,
    backgroundColor: colors.white,
  },
  imageCard: {
    marginBottom: spacing.lg,
  },
  capturedImage: {
    width: '100%',
    height: 300,
    borderRadius: 12,
  },
  sizeRecommendation: {
    backgroundColor: colors.primary + '20',
    marginBottom: spacing.lg,
    alignItems: 'center',
  },
  sizeRecommendationTitle: {
    fontSize: 14,
    color: colors.primary,
    marginBottom: spacing.sm,
  },
  sizeRecommendationValue: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: spacing.sm,
  },
  sizeRecommendationSubtitle: {
    fontSize: 12,
    color: colors.gray[600],
  },
  assistantCard: {
    backgroundColor: colors.info + '15',
    marginBottom: spacing.lg,
    alignItems: 'center',
  },
  assistantIcon: {
    fontSize: 32,
    marginBottom: spacing.sm,
  },
  assistantTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.info,
    marginBottom: spacing.sm,
  },
  assistantTip: {
    fontSize: 13,
    color: colors.gray[700],
    textAlign: 'center',
    lineHeight: 20,
  },
  actionButton: {
    marginBottom: spacing.md,
  },
  actionButtons: {
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  comparisonContainer: {
    flex: 1,
    padding: spacing.lg,
    backgroundColor: colors.white,
  },
  comparisonTitle: {
    ...typography.h3,
    marginBottom: spacing.lg,
    color: colors.black,
  },
  comparisonItem: {
    marginBottom: spacing.xl,
  },
  sizeLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.black,
    marginBottom: spacing.md,
  },
  comparisonImage: {
    width: '100%',
    height: 300,
    borderRadius: 12,
    marginBottom: spacing.md,
  },
  prendaSelector: {
    flex: 1,
    padding: spacing.lg,
    backgroundColor: colors.white,
  },
  modalTitle: {
    ...typography.h3,
    marginBottom: spacing.lg,
    color: colors.black,
  },
  prendaOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.gray[50],
    borderRadius: 12,
    marginBottom: spacing.md,
  },
  prendaEmoji: {
    fontSize: 28,
    marginRight: spacing.lg,
  },
  prendaInfo: {
    flex: 1,
  },
  prendaNombre: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.black,
    marginBottom: spacing.sm,
  },
  prendaColor: {
    fontSize: 12,
    color: colors.gray[600],
  },
});
