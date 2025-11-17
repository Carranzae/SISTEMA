import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Text,
  Alert,
} from 'react-native';
import { Header, Button, Card, Loading } from '@components/common';
import { colors, spacing, typography } from '@theme/index';
import { useBusiness, useSales } from '@hooks/useBusiness';
import { exportService } from '@services/export/export.service';

interface ExportOption {
  id: string;
  title: string;
  description: string;
  emoji: string;
  format: 'csv' | 'pdf';
}

const EXPORT_OPTIONS: ExportOption[] = [
  {
    id: 'sales_month',
    title: 'Ventas del Mes',
    description: 'Exportar todas las ventas en CSV',
    emoji: '📊',
    format: 'csv',
  },
  {
    id: 'inventory',
    title: 'Inventario Actual',
    description: 'Estado actual del stock',
    emoji: '📦',
    format: 'csv',
  },
  {
    id: 'daily_report',
    title: 'Reporte Diario',
    description: 'Resumen del día actual',
    emoji: '📅',
    format: 'pdf',
  },
];

export default function ExportReportsScreen() {
  const { business } = useBusiness();
  const { ventas } = useSales();
  const [isLoading, setIsLoading] = useState(false);

  const handleExport = async (option: ExportOption) => {
    setIsLoading(true);
    try {
      let fileUri: string;

      if (option.id === 'sales_month') {
        fileUri = await exportService.generateSalesReport(
          ventas,
          business?.nombre_comercial || 'Reporte',
          business?.moneda || 'PEN'
        );
      } else if (option.id === 'inventory') {
        // Aquí iría la llamada a productos
        Alert.alert('Info', 'Esta función requiere datos de inventario');
        setIsLoading(false);
        return;
      } else {
        const content = `REPORTE DIARIO
${new Date().toLocaleDateString('es-PE')}

Negocio: ${business?.nombre_comercial}
Total Ventas: ${ventas.length}
`;
        fileUri = await exportService.generatePDFText(
          content,
          'reporte_diario'
        );
      }

      await exportService.shareFile(
        fileUri,
        `${option.id}_${Date.now()}`
      );

      Alert.alert('✅ Éxito', 'Reporte generado y compartido');
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) return <Loading fullScreen />;

  return (
    <View style={styles.container}>
      <Header
        title="📥 Exportar Reportes"
        subtitle="Descarga tus datos"
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>Opciones Disponibles</Text>

        {EXPORT_OPTIONS.map((option) => (
          <Card key={option.id} style={styles.exportCard}>
            <View style={styles.exportHeader}>
              <Text style={styles.exportEmoji}>{option.emoji}</Text>
              <View style={styles.exportInfo}>
                <Text style={styles.exportTitle}>{option.title}</Text>
                <Text style={styles.exportDescription}>
                  {option.description}
                </Text>
              </View>
            </View>

            <Button
              label={`📥 Exportar (${option.format.toUpperCase()})`}
              onPress={() => handleExport(option)}
              fullWidth
              variant="secondary"
            />
          </Card>
        ))}

        <Card style={styles.infoCard}>
          <Text style={styles.infoTitle}>ℹ️ Información</Text>
          <Text style={styles.infoText}>
            • Los reportes se exportan en los formatos indicados
          </Text>
          <Text style={styles.infoText}>
            • Puedes compartir los archivos por email o WhatsApp
          </Text>
          <Text style={styles.infoText}>
            • Los datos se descarguen en tu dispositivo
          </Text>
        </Card>
      </ScrollView>
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
    padding: spacing.lg,
  },
  sectionTitle: {
    ...typography.h4,
    marginBottom: spacing.lg,
    color: colors.black,
  },
  exportCard: {
    marginBottom: spacing.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  exportHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  exportEmoji: {
    fontSize: 32,
    marginRight: spacing.md,
  },
  exportInfo: {
    flex: 1,
  },
  exportTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.black,
    marginBottom: spacing.sm,
  },
  exportDescription: {
    fontSize: 12,
    color: colors.gray[600],
  },
  infoCard: {
    marginBottom: spacing.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.black,
    marginBottom: spacing.md,
  },
  infoText: {
    fontSize: 13,
    color: colors.gray[700],
    marginBottom: spacing.sm,
  },
});
