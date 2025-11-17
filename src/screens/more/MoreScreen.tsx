import React from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Text,
} from 'react-native';
import { Header, Card } from '@components/common';
import { colors, spacing, typography } from '@theme/index';

interface MoreScreenProps {
  onNavigate: (screen: string) => void;
}

export default function MoreScreen({ onNavigate }: MoreScreenProps) {
  const menuItems = [
    {
      emoji: '📈',
      label: 'Reportes',
      screen: 'reports',
      description: 'Análisis de ventas',
    },
    {
      emoji: '👫',
      label: 'Clientes',
      screen: 'clients',
      description: 'Gestión de clientes',
    },
    {
      emoji: '👥',
      label: 'Usuarios',
      screen: 'users',
      description: 'Multi-usuario',
    },
    {
      emoji: '⚙️',
      label: 'Configuración',
      screen: 'settings',
      description: 'Datos del negocio',
    },
  ];

  return (
    <View style={styles.container}>
      <Header title="⋯ Más Opciones" subtitle="Acceso rápido" />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.menuGrid}>
          {menuItems.map((item) => (
            <TouchableOpacity
              key={item.screen}
              style={styles.menuCard}
              onPress={() => onNavigate(item.screen)}
            >
              <Text style={styles.menuEmoji}>{item.emoji}</Text>
              <Text style={styles.menuLabel}>{item.label}</Text>
              <Text style={styles.menuDescription}>{item.description}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Card>
          <Text style={styles.sectionTitle}>ℹ️ Información</Text>
          <Text style={styles.infoText}>
            OmniTienda BPM v0.1.0
          </Text>
          <Text style={styles.infoText}>
            Software inteligente para PyMEs en Perú
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
  menuGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  menuCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: colors.gray[50],
    borderRadius: 12,
    padding: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.gray[200],
  },
  menuEmoji: {
    fontSize: 32,
    marginBottom: spacing.md,
  },
  menuLabel: {
    ...typography.bodySm,
    fontWeight: '600',
    color: colors.black,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  menuDescription: {
    fontSize: 10,
    color: colors.gray[600],
    textAlign: 'center',
  },
  sectionTitle: {
    ...typography.h4,
    marginBottom: spacing.lg,
    color: colors.black,
  },
  infoText: {
    fontSize: 13,
    color: colors.gray[700],
    marginBottom: spacing.md,
  },
});
