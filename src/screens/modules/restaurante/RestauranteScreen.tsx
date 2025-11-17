import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Text,
} from 'react-native';
import { Header, Button, Card, Input, Loading } from '@components/common';
import { colors, spacing, typography } from '@theme/index';

export default function RestauranteScreen() {
  const [mesasOcupadas, setMesasOcupadas] = useState([]);
  const [pedidosPendientes, setPedidosPendientes] = useState(0);

  return (
    <View style={styles.container}>
      <Header
        title="🍕 Restaurante"
        subtitle="Gestión de pedidos"
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Mesas */}
        <Card>
          <Text style={styles.sectionTitle}>🪑 Mesas</Text>
          <View style={styles.tablasGrid}>
            {[1, 2, 3, 4, 5, 6, 7, 8].map((mesa) => (
              <TouchableOpacity
                key={mesa}
                style={[
                  styles.mesaButton,
                  mesasOcupadas.includes(mesa) && styles.mesaOcupada,
                ]}
              >
                <Text style={styles.mesaNumber}>{mesa}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Card>

        {/* Pedidos Pendientes */}
        <Card>
          <Text style={styles.sectionTitle}>📋 Pedidos Pendientes</Text>
          <Text style={styles.pedidosCount}>{pedidosPendientes}</Text>
          <Button
            label="Ver Pedidos"
            onPress={() => {}}
            fullWidth
          />
        </Card>

        {/* Menú */}
        <Card>
          <Text style={styles.sectionTitle}>🍽️ Menú</Text>
          <Button
            label="Gestionar Menú"
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
    marginBottom: spacing.lg,
  },
  tablasGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  mesaButton: {
    flex: 1,
    minWidth: '22%',
    aspectRatio: 1,
    backgroundColor: colors.success + '20',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.success,
  },
  mesaOcupada: {
    backgroundColor: colors.error + '20',
    borderColor: colors.error,
  },
  mesaNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.black,
  },
  pedidosCount: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.warning,
    marginBottom: spacing.lg,
  },
});
