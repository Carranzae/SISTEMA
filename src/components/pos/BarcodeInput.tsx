import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { Input } from '@components/common';
import { BarcodeScanner } from '@components/common/BarcodeScanner';
import { colors, spacing } from '@theme/index';

interface BarcodeInputProps {
  value: string;
  onChangeText: (text: string) => void;
  onScan: (barcode: string) => void;
  placeholder?: string;
}

export const BarcodeInput: React.FC<BarcodeInputProps> = ({
  value,
  onChangeText,
  onScan,
  placeholder = 'Buscar o escanear código',
}) => {
  const [showScanner, setShowScanner] = useState(false);

  const handleBarcodeScan = (barcode: string) => {
    onScan(barcode);
    setShowScanner(false);
  };

  return (
    <>
      <View style={styles.container}>
        <Input
          placeholder={placeholder}
          value={value}
          onChangeText={onChangeText}
          containerStyle={styles.input}
        />
        <TouchableOpacity
          style={styles.scanButton}
          onPress={() => setShowScanner(true)}
        >
          <Text style={styles.scanIcon}>📷</Text>
        </TouchableOpacity>
      </View>

      <BarcodeScanner
        visible={showScanner}
        onClose={() => setShowScanner(false)}
        onBarcodeScan={handleBarcodeScan}
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  input: {
    marginBottom: 0,
    flex: 1,
  },
  scanButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanIcon: {
    fontSize: 20,
  },
});
