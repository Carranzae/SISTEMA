import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Text,
  Alert,
  Switch,
} from 'react-native';
import { Header, Button, Modal, Input, Card, Loading } from '@components/common';
import { colors, spacing, typography } from '@theme/index';
import { useBusiness } from '@hooks/useBusiness';
import { useAuthStore } from '@store/auth.store';
import { businessService } from '@services/supabase/business.service';

interface SettingsScreenProps {
  onNavigate?: (screen: string) => void;
}

export default function SettingsScreen({ onNavigate }: SettingsScreenProps) {
  const { business, updateBusiness, isLoading } = useBusiness();
  const { signOut } = useAuthStore();
  const [showEditModal, setShowEditModal] = useState(false);
  const [editData, setEditData] = useState({
    nombre_comercial: business?.nombre_comercial || '',
    ruc: business?.ruc || '',
    direccion_completa: business?.direccion_completa || '',
  });

  const handleUpdateBusiness = async () => {
    try {
      await updateBusiness(editData);
      Alert.alert('✅ Éxito', 'Datos actualizados correctamente');
      setShowEditModal(false);
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  const handleLogout = async () => {
    Alert.alert('Cerrar Sesión', '¿Deseas cerrar sesión?', [
      { text: 'Cancelar' },
      {
        text: 'Cerrar Sesión',
        onPress: async () => {
          try {
            await signOut();
          } catch (error: any) {
            Alert.alert('Error', error.message);
          }
        },
        style: 'destructive',
      },
    ]);
  };

  if (isLoading) return <Loading fullScreen />;

  if (!business) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>Negocio no encontrado</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header
        title="⚙️ Configuración"
        subtitle="Gestiona tu negocio"
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Sección: Datos del Negocio */}
        <Card>
          <Text style={styles.sectionTitle}>📋 Datos del Negocio</Text>

          <SettingRow
            label="Nombre"
            value={business.nombre_comercial}
            icon="🏪"
          />

          <SettingRow
            label="RUC"
            value={business.ruc || 'No registrado'}
            icon="📄"
          />

          <SettingRow
            label="Rubro"
            value={business.rubro}
            icon="🎯"
          />

          <SettingRow
            label="Modelo"
            value={business.modelo_negocio}
            icon="📊"
          />

          <SettingRow
            label="Ubicación"
            value={`${business.distrito}, ${business.provincia}`}
            icon="📍"
          />

          <Button
            label="✏️ Editar Datos"
            onPress={() => setShowEditModal(true)}
            variant="secondary"
            fullWidth
            style={styles.editButton}
          />
        </Card>

        {/* Sección: Plan y Suscripción */}
        <Card>
          <Text style={styles.sectionTitle}>💳 Plan de Suscripción</Text>

          <View style={styles.planBadge}>
            <Text style={styles.planName}>{business.plan_actual}</Text>
            <Text style={styles.planPrice}>
              S/ {getPlanPrice(business.plan_actual)}/mes
            </Text>
          </View>

          <View style={styles.planFeatures}>
            <PlanFeature text="Inventario ilimitado" included={true} />
            <PlanFeature text="Reportes avanzados" included={true} />
            <PlanFeature text="Multi-usuario" included={business.plan_actual !== 'GRATUITO'} />
            <PlanFeature text="Facturación electrónica" included={business.plan_actual === 'PROFESIONAL' || business.plan_actual === 'EMPRESARIAL'} />
          </View>

          <Button
            label="📈 Cambiar Plan"
            onPress={() => Alert.alert('Próximamente', 'Esta función estará disponible pronto')}
            fullWidth
            style={styles.upgradeButton}
          />
        </Card>

        {/* Sección: Módulos */}
        <Card>
          <Text style={styles.sectionTitle}>🎁 Módulos Activos</Text>

          {Object.entries(business.modulos_activos).map(([module, active]) => (
            <ModuleRow
              key={module}
              module={module}
              active={active as boolean}
            />
          ))}
        </Card>

        {/* Sección: Cuenta */}
        <Card>
          <Text style={styles.sectionTitle}>👤 Cuenta</Text>

          <Button
            label="🔐 Cambiar Contraseña"
            onPress={() => Alert.alert('Próximamente', 'Esta función estará disponible pronto')}
            variant="secondary"
            fullWidth
            style={styles.accountButton}
          />

          <Button
            label="🚪 Cerrar Sesión"
            onPress={handleLogout}
            variant="danger"
            fullWidth
          />
        </Card>

        {/* Sección: Información */}
        <Card>
          <Text style={styles.sectionTitle}>ℹ️ Información</Text>

          <Text style={styles.infoText}>
            OmniTienda BPM v0.1.0
          </Text>

          <Text style={styles.infoText}>
            © 2024 - Software inteligente para PyMEs en Perú
          </Text>

          <TouchableOpacity>
            <Text style={styles.linkText}>Términos y Condiciones</Text>
          </TouchableOpacity>
        </Card>
      </ScrollView>

      {/* Modal Editar Datos */}
      <Modal visible={showEditModal} onClose={() => setShowEditModal(false)}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Editar Datos del Negocio</Text>

          <Input
            label="Nombre Comercial"
            value={editData.nombre_comercial}
            onChangeText={(v) =>
              setEditData({ ...editData, nombre_comercial: v })
            }
          />

          <Input
            label="RUC"
            value={editData.ruc}
            onChangeText={(v) => setEditData({ ...editData, ruc: v })}
            keyboardType="numeric"
            maxLength={11}
          />

          <Input
            label="Dirección Completa"
            value={editData.direccion_completa}
            onChangeText={(v) =>
              setEditData({ ...editData, direccion_completa: v })
            }
            multiline
          />

          <Button
            label="Guardar Cambios"
            onPress={handleUpdateBusiness}
            fullWidth
            loading={isLoading}
            style={styles.saveButton}
          />

          <Button
            label="Cancelar"
            onPress={() => setShowEditModal(false)}
            variant="ghost"
            fullWidth
          />
        </View>
      </Modal>
    </View>
  );
}

interface SettingRowProps {
  label: string;
  value: string;
  icon: string;
}

const SettingRow: React.FC<SettingRowProps> = ({ label, value, icon }) => (
  <View style={styles.settingRow}>
    <Text style={styles.settingIcon}>{icon}</Text>
    <View style={styles.settingContent}>
      <Text style={styles.settingLabel}>{label}</Text>
      <Text style={styles.settingValue}>{value}</Text>
    </View>
  </View>
);

interface PlanFeatureProps {
  text: string;
  included: boolean;
}

const PlanFeature: React.FC<PlanFeatureProps> = ({ text, included }) => (
  <View style={styles.featureRow}>
    <Text style={styles.featureIcon}>{included ? '✅' : '❌'}</Text>
    <Text style={[styles.featureText, !included && styles.featureTextDisabled]}>
      {text}
    </Text>
  </View>
);

interface ModuleRowProps {
  module: string;
  active: boolean;
}

const ModuleRow: React.FC<ModuleRowProps> = ({ module, active }) => (
  <View style={styles.moduleRow}>
    <Text style={styles.moduleName}>{formatModuleName(module)}</Text>
    <View style={[styles.moduleBadge, active ? styles.moduleBadgeActive : styles.moduleBadgeInactive]}>
      <Text style={styles.moduleBadgeText}>{active ? 'Activo' : 'Inactivo'}</Text>
    </View>
  </View>
);

const formatModuleName = (module: string): string => {
  const names: Record<string, string> = {
    facturacion_electronica: '📄 Facturación Electrónica',
    integracion_yape: '💳 Integración Yape',
    integracion_plin: '💳 Integración Plin',
    marketplace: '🛒 Marketplace',
    multi_usuario: '👥 Multi-usuario',
    delivery: '🚚 Control de Delivery',
    servicio_tecnico: '🔧 Servicio Técnico',
  };
  return names[module] || module;
};

const getPlanPrice = (plan: string): number => {
  const prices: Record<string, number> = {
    GRATUITO: 0,
    BASICO: 49,
    PROFESIONAL: 99,
    EMPRESARIAL: 199,
  };
  return prices[plan] || 0;
};

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
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  settingIcon: {
    fontSize: 20,
    marginRight: spacing.md,
  },
  settingContent: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 14,
    color: colors.gray[600],
    marginBottom: 2,
  },
  settingValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.black,
  },
  editButton: {
    marginTop: spacing.lg,
  },
  planBadge: {
    backgroundColor: colors.primary + '20',
    borderRadius: 8,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    alignItems: 'center',
  },
  planName: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: spacing.sm,
  },
  planPrice: {
    fontSize: 14,
    color: colors.gray[700],
  },
  planFeatures: {
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  featureIcon: {
    fontSize: 16,
  },
  featureText: {
    fontSize: 14,
    color: colors.black,
  },
  featureTextDisabled: {
    color: colors.gray[500],
    textDecorationLine: 'line-through',
  },
  upgradeButton: {
    marginBottom: spacing.lg,
  },
  moduleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  moduleName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.black,
  },
  moduleBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 6,
  },
  moduleBadgeActive: {
    backgroundColor: colors.success + '20',
  },
  moduleBadgeInactive: {
    backgroundColor: colors.gray[200],
  },
  moduleBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.black,
  },
  accountButton: {
    marginBottom: spacing.md,
  },
  infoText: {
    fontSize: 13,
    color: colors.gray[700],
    marginBottom: spacing.md,
  },
  linkText: {
    fontSize: 13,
    color: colors.primary,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  modalContent: {
    padding: spacing.lg,
  },
  modalTitle: {
    ...typography.h3,
    marginBottom: spacing.lg,
    color: colors.black,
  },
  saveButton: {
    marginVertical: spacing.lg,
  },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    ...typography.body,
    color: colors.gray[600],
  },
});
