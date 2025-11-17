import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Text,
  Alert,
} from 'react-native';
import { Header, Button, Modal, Input, Card, Loading } from '@components/common';
import { colors, spacing, typography } from '@theme/index';
import { useBusiness, useSales } from '@hooks/index';
import { formatCurrency, formatDate } from '@utils/formatters';

interface ReportOption {
  id: string;
  name: string;
  description: string;
  emoji: string;
  type: 'sales' | 'inventory' | 'financial' | 'daily';
}

const REPORT_OPTIONS: ReportOption[] = [
  {
    id: 'sales_daily',
    name: 'Ventas Diarias',
    description: 'Reporte detallado de ventas del día',
    emoji: '📊',
    type: 'daily',
  },
  {
    id: 'sales_monthly',
    name: 'Ventas Mensuales',
    description: 'Análisis de ventas por mes',
    emoji: '📈',
    type: 'sales',
  },
  {
    id: 'inventory_status',
    name: 'Estado del Inventario',
    description: 'Posición actual de stock',
    emoji: '📦',
    type: 'inventory',
  },
  {
    id: 'financial_summary',
    name: 'Resumen Financiero',
    description: 'Ingresos, gastos y utilidades',
    emoji: '💰',
    type: 'financial',
  },
];

export default function AdvancedReportsScreen() {
  const { business } = useBusiness();
  const [selectedReport, setSelectedReport] = useState<ReportOption | null>(
    null
  );
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [startDate, setStartDate] = useState(
    new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [endDate, setEndDate] = useState(
    new Date().toISOString().split('T')[0]
  );

  const handleGenerateReport = async (report: ReportOption) => {
    if (!business) return;

    setIsLoading(true);
    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/api/v1/reports/generate`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            type: report.type,
            businessId: business.id,
            startDate,
            endDate,
          }),
        }
      );

      if (response.ok) {
        const blob = await response.blob();
        // Guardar o compartir PDF
        Alert.alert('✅ Éxito', 'Reporte generado correctamente');
      } else {
        Alert.alert('Error', 'No se pudo generar el reporte');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setIsLoading(false);
      setShowDatePicker(false);
    }
  };

  return (
    <View style={styles.container}>
      <Header
        title="📊 Reportes Avanzados"
        subtitle="Análisis y estadísticas"
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>Selecciona un Reporte</Text>

        {REPORT_OPTIONS.map((report) => (
          <TouchableOpacity
            key={report.id}
            style={styles.reportCard}
            onPress={() => {
              setSelectedReport(report);
              setShowDatePicker(true);
            }}
          >
            <Text style={styles.reportEmoji}>{report.emoji}</Text>
            <View style={styles.reportInfo}>
              <Text style={styles.reportName}>{report.name}</Text>
              <Text style={styles.reportDescription}>
                {report.description}
              </Text>
            </View>
            <Text style={styles.arrow}>→</Text>
          </TouchableOpacity>
        ))}

        {/* Información */}
        <Card>
          <Text style={styles.infoTitle}>ℹ️ Acerca de Reportes</Text>
          <Text style={styles.infoText}>
            • Los reportes se generan en PDF
          </Text>
          <Text style={styles.infoText}>
            • Puedes seleccionar el rango de fechas
          </Text>
          <Text style={styles.infoText}>
            • Los datos se actualizan en tiempo real
          </Text>
        </Card>
      </ScrollView>

      {/* Modal Fecha */}
      <Modal
        visible={showDatePicker}
        onClose={() => setShowDatePicker(false)}
      >
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>
            {selectedReport?.name}
          </Text>
          <Text style={styles.dateLabel}>Desde</Text>
          <Input
            placeholder="YYYY-MM-DD"
            value={startDate}
            onChangeText={setStartDate}
          />

          <Text style={styles.dateLabel}>Hasta</Text>
          <Input
            placeholder="YYYY-MM-DD"
            value={endDate}
            onChangeText={setEndDate}
          />

          <Button
            label="Generar PDF"
            onPress={() => {
              if (selectedReport) {
                handleGenerateReport(selectedReport);
              }
            }}
            fullWidth
            loading={isLoading}
            style={styles.generateButton}
          />

          <Button
            label="Cancelar"
            onPress={() => setShowDatePicker(false)}
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
  content: {
    flex: 1,
    padding: spacing.lg,
  },
  sectionTitle: {
    ...typography.h4,
    marginBottom: spacing.lg,
    color: colors.black,
  },
  reportCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.gray[50],
    borderRadius: 12,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  reportEmoji: {
    fontSize: 32,
    marginRight: spacing.lg,
  },
  reportInfo: {
    flex: 1,
  },
  reportName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.black,
    marginBottom: spacing.sm,
  },
  reportDescription: {
    fontSize: 12,
    color: colors.gray[600],
  },
  arrow: {
    fontSize: 18,
    color: colors.primary,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: spacing.md,
    color: colors.black,
  },
  infoText: {
    fontSize: 13,
    color: colors.gray[700],
    marginBottom: spacing.sm,
  },
  modalContent: {
    padding: spacing.lg,
  },
  modalTitle: {
    ...typography.h3,
    marginBottom: spacing.lg,
    color: colors.black,
  },
  dateLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.gray[700],
    marginBottom: spacing.sm,
    marginTop: spacing.md,
  },
  generateButton: {
    marginVertical: spacing.lg,
  },
});
