import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Text,
} from 'react-native';
import { Header, Card, Button } from '@components/common';
import { colors, spacing, typography } from '@theme/index';

interface Medicamento {
  id: string;
  nombre: string;
  principio_activo: string;
  fecha_vencimiento: string;
  stock: number;
}

export default function FarmaciaScreen() {
  const [medicamentos, setMedicamentos] = useState<Medicamento[]>([]);

  return (
    <View style={styles.container}>
      <Header
        title="💊 Farmacia"
        subtitle="Control de medicamentos"
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Alertas Vencimiento */}
        <Card>
          <Text style={styles.sectionTitle}>⚠️ Vencimientos</Text>
          <Button
            label="Ver Vencidos"
            onPress={() => {}}
            variant="danger"
            fullWidth
            style={styles.button}
          />
          <Button
            label="Por Vencer (30 días)"
            onPress={() => {}}
            variant="warning"
            fullWidth
          />
        </Card>

        {/* Recetas */}
        <Card>
          <Text style={styles.sectionTitle}>💳 Recetas</Text>
          <Button
            label="Nueva Receta"
            onPress={() => {}}
            fullWidth
          />
        </Card>

        {/* Buscar Medicamento */}
        <Card>
          <Text style={styles.sectionTitle}>🔍 Buscar</Text>
          <Button
            label="Por Principio Activo"
            onPress={() => {}}
            variant="secondary"
            fullWidth
            style={styles.button}
          />
          <Button
            label="Por Código"
            onPress={() => {}}
            variant="secondary"
            fullWidth
          />
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
    fontSize: 16,
    fontWeight: '700',
    color: colors.black,
    marginBottom: spacing.md,
  },
  button: {
    marginBottom: spacing.md,
  },
});
