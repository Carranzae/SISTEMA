import React, { useState, useRef } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  Alert,
  Modal,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { colors, spacing } from '@theme/index';

interface BarcodeScannerProps {
  visible: boolean;
  onClose: () => void;
  onBarcodeScan: (barcode: string) => void;
}

export const BarcodeScanner: React.FC<BarcodeScannerProps> = ({
  visible,
  onClose,
  onBarcodeScan,
}) => {
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<any>(null);
  const [scanned, setScanned] = useState(false);

  if (!permission) {
    return <View />;
  }

  if (!permission.granted) {
    return (
      <Modal visible={visible} animationType="slide">
        <View style={styles.container}>
          <Text style={styles.title}>Permiso de Cámara Requerido</Text>
          <TouchableOpacity
            style={styles.permissionButton}
            onPress={requestPermission}
          >
            <Text style={styles.permissionButtonText}>
              Permitir Acceso a Cámara
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>Cerrar</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    );
  }

  const handleBarCodeScanned = ({ data }: { data: string }) => {
    if (scanned) return;
    setScanned(true);
    onBarcodeScan(data);
    Alert.alert('Código Escaneado', `Código: ${data}`, [
      {
        text: 'OK',
        onPress: () => {
          setScanned(false);
        },
      },
    ]);
  };

  return (
    <Modal visible={visible} animationType="slide">
      <View style={styles.container}>
        <CameraView
          style={styles.camera}
          ref={cameraRef}
          onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
          barcodeScannerSettings={{
            barcodeTypes: [
              'ean13',
              'ean8',
              'code128',
              'code39',
              'qr',
              'upce',
              'pdf417',
            ],
          }}
        >
          <View style={styles.overlay}>
            <View style={styles.unfocusedContainer} />

            <View style={styles.focusedContainer}>
              <View style={styles.unfocusedContainer} />
              <View style={styles.scanArea} />
              <View style={styles.unfocusedContainer} />
            </View>

            <View style={styles.unfocusedContainer} />
          </View>

          <View style={styles.controls}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
            >
              <Text style={styles.closeButtonText}>✕ Cerrar</Text>
            </TouchableOpacity>
          </View>
        </CameraView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.black,
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    flexDirection: 'column',
  },
  unfocusedContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  focusedContainer: {
    flex: 2,
    flexDirection: 'row',
  },
  scanArea: {
    flex: 1,
    borderColor: colors.primary,
    borderWidth: 3,
    backgroundColor: 'transparent',
  },
  controls: {
    position: 'absolute',
    bottom: spacing.lg,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  closeButton: {
    backgroundColor: colors.error,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: 8,
  },
  closeButtonText: {
    color: colors.white,
    fontWeight: '700',
    fontSize: 14,
  },
  title: {
    color: colors.white,
    fontSize: 18,
    fontWeight: '700',
    marginTop: spacing.xl,
    marginHorizontal: spacing.lg,
  },
  permissionButton: {
    backgroundColor: colors.primary,
    marginHorizontal: spacing.lg,
    marginVertical: spacing.lg,
    paddingVertical: spacing.lg,
    borderRadius: 8,
    alignItems: 'center',
  },
  permissionButtonText: {
    color: colors.white,
    fontWeight: '700',
    fontSize: 14,
  },
});
