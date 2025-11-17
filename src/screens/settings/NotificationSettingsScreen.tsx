import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Text,
  Switch,
} from 'react-native';
import { Header, Card, Button } from '@components/common';
import { colors, spacing, typography } from '@theme/index';
import { useAuthStore } from '@store/auth.store';
import { useBusiness } from '@hooks/useBusiness';
import { supabase } from '@services/supabase/client';

interface NotificationPreference {
  tipo: string;
  push: boolean;
  email: boolean;
  descripcion: string;
  emoji: string;
}

export default function NotificationSettingsScreen() {
  const { user } = useAuthStore();
  const { business } = useBusiness();

  const [preferences, setPreferences] = useState<NotificationPreference[]>([
    {
      tipo: 'VENTA_GRANDE',
      push: true,
      email: true,
      descripcion: 'Ventas mayores a S/ 500',
      emoji: '💰',
    },
    {
      tipo: 'INVENTARIO_BAJO',
      push: true,
      email: false,
      descripcion: 'Stock por debajo del mínimo',
      emoji: '📉',
    },
    {
      tipo: 'CAMBIO_CAJA',
      push: true,
      email: false,
      descripcion: 'Movimientos de caja',
      emoji: '💵',
    },
    {
      tipo: 'ACCESO_USUARIO',
      push: true,
      email: true,
      descripcion: 'Cambios de acceso de usuarios',
      emoji: '👤',
    },
    {
      tipo: 'MODIFICACION_MASIVA',
      push: true,
      email: true,
      descripcion: 'Cambios masivos en inventario',
      emoji: '🔄',
    },
  ]);

  const handleTogglePush = (index: number) => {
    const newPreferences = [...preferences];
    newPreferences[index].push = !newPreferences[index].push;
    setPreferences(newPreferences);
  };

  const handleToggleEmail = (index: number) => {
    const newPreferences = [...preferences];
    newPreferences[index].email = !newPreferences[index].email;
    setPreferences(newPreferences);
  };

  const handleSave = async () => {
    if (!user || !business) return;

    try {
      await supabase
        .from('usuarios')
        .update({
          notification_preferences: preferences,
        })
        .eq('id', user.id);

      alert('✅ Preferencias guardadas');
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Header
        title="🔔 Notificaciones"
        subtitle="Personaliza tus alertas"
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Card style={styles.introCard}>
          <Text style={styles.introText}>
            Elige cuándo y cómo deseas recibir notificaciones sobre eventos importantes
          </Text>
        </Card>

        {preferences.map((pref, index) => (
          <Card key={pref.tipo} style={styles.preferenceCard}>
            <View style={styles.preferenceHeader}>
              <Text style={styles.preferenceEmoji}>{pref.emoji}</Text>
              <View style={styles.preferenceInfo}>
                <Text style={styles.preferenceTitle}>{pref.tipo}</Text>
                <Text style={styles.preferenceDesc}>{pref.descripcion}</Text>
              </View>
            </View>

            <View style={styles.preferenceControls}>
              <View style={styles.controlRow}>
                <Text style={styles.controlLabel}>📱 Push</Text>
                <Switch
                  value={pref.push}
                  onValueChange={() => handleTogglePush(index)}
                  trackColor={{ false: colors.gray[300], true: colors.primary }}
                  thumbColor={pref.push ? colors.white : colors.gray[200]}
                />
              </View>

              <View style={styles.controlRow}>
                <Text style={styles.controlLabel}>📧 Email</Text>
                <Switch
                  value={pref.email}
                  onValueChange={() => handleToggleEmail(index)}
                  trackColor={{ false: colors.gray[300], true: colors.primary }}
                  thumbColor={pref.email ? colors.white : colors.gray[200]}
                />
              </View>
            </View>
          </Card>
        ))}

        <Button
          label="💾 Guardar Preferencias"
          onPress={handleSave}
          fullWidth
          style={styles.saveButton}
        />
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
  introCard: {
    backgroundColor: colors.info + '15',
    marginBottom: spacing.lg,
  },
  introText: {
    fontSize: 13,
    color: colors.info,
    lineHeight: 18,
  },
  preferenceCard: {
    marginBottom: spacing.lg,
  },
  preferenceHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  preferenceEmoji: {
    fontSize: 24,
  },
  preferenceInfo: {
    flex: 1,
  },
  preferenceTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.black,
    marginBottom: spacing.sm,
  },
  preferenceDesc: {
    fontSize: 12,
    color: colors.gray[600],
  },
  preferenceControls: {
    gap: spacing.md,
    paddingTopMargin: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.gray[200],
    paddingTop: spacing.lg,
  },
  controlRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  controlLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.gray[700],
  },
  saveButton: {
    marginVertical: spacing.lg,
  },
});
