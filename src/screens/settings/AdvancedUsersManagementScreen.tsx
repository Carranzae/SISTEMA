import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Text,
  Alert,
  FlatList,
} from 'react-native';
import { Header, Button, Modal, Input, Card, Loading } from '@components/common';
import { colors, spacing, typography } from '@theme/index';
import { useBusiness } from '@hooks/useBusiness';
import { useAuthStore } from '@store/auth.store';
import { usersAdvancedService } from '@services/supabase/users-advanced.service';
import type { UsuarioRegistrado, UserRole } from '@types/permissions';

const ROLES: UserRole[] = ['ADMIN', 'VENDEDOR', 'CAJERO', 'ALMACENERO', 'CONTADOR'];

const ROLE_INFO: Record<UserRole, { emoji: string; descripcion: string; color: string }> = {
  ADMIN: {
    emoji: '👑',
    descripcion: 'Acceso total al sistema',
    color: colors.error,
  },
  VENDEDOR: {
    emoji: '💼',
    descripcion: 'Realiza ventas',
    color: colors.primary,
  },
  CAJERO: {
    emoji: '💰',
    descripcion: 'Gestiona caja',
    color: colors.success,
  },
  ALMACENERO: {
    emoji: '📦',
    descripcion: 'Gestiona inventario',
    color: colors.warning,
  },
  CONTADOR: {
    emoji: '📊',
    descripcion: 'Acceso a reportes',
    color: colors.info,
  },
};

export default function AdvancedUsersManagementScreen() {
  const { business } = useBusiness();
  const { user: currentUser } = useAuthStore();

  const [empleados, setEmpleados] = useState<UsuarioRegistrado[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedEmpleado, setSelectedEmpleado] = useState<UsuarioRegistrado | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    telefono: '',
    rol: 'VENDEDOR' as UserRole,
  });

  useEffect(() => {
    loadEmpleados();
  }, [business]);

  const loadEmpleados = async () => {
    if (!business) return;
    setIsLoading(true);
    try {
      const data = await usersAdvancedService.getEmployees(business.id);
      setEmpleados(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddEmpleado = async () => {
    if (!formData.nombre.trim() || !formData.email.trim() || !business || !currentUser) {
      Alert.alert('Error', 'Completa todos los campos requeridos');
      return;
    }

    setIsLoading(true);
    try {
      const newEmpleado = await usersAdvancedService.registerEmployee(
        business.id,
        currentUser.id,
        {
          nombre: formData.nombre,
          email: formData.email,
          telefono: formData.telefono,
          rol: formData.rol,
        }
      );

      setEmpleados([newEmpleado, ...empleados]);
      setFormData({ nombre: '', email: '', telefono: '', rol: 'VENDEDOR' });
      setShowAddModal(false);
      Alert.alert('✅ Éxito', 'Empleado registrado correctamente');
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangeRole = async (empleadoId: string, nuevoRol: UserRole) => {
    if (!business || !currentUser) return;

    Alert.alert(
      'Cambiar Rol',
      `¿Cambiar rol a ${nuevoRol}?`,
      [
        { text: 'Cancelar' },
        {
          text: 'Cambiar',
          onPress: async () => {
            try {
              await usersAdvancedService.changeRole(
                empleadoId,
                nuevoRol,
                currentUser.id,
                business.id
              );
              loadEmpleados();
              Alert.alert('✅ Éxito', 'Rol actualizado');
            } catch (error: any) {
              Alert.alert('Error', error.message);
            }
          },
        },
      ]
    );
  };

  const handleDeactivateEmpleado = async (empleadoId: string) => {
    if (!business || !currentUser) return;

    Alert.alert(
      'Desactivar Empleado',
      '¿Estás seguro? El empleado no podrá acceder al sistema',
      [
        { text: 'Cancelar' },
        {
          text: 'Desactivar',
          onPress: async () => {
            try {
              await usersAdvancedService.deactivateUser(
                empleadoId,
                currentUser.id,
                business.id
              );
              loadEmpleados();
              Alert.alert('✅ Éxito', 'Empleado desactivado');
            } catch (error: any) {
              Alert.alert('Error', error.message);
            }
          },
          style: 'destructive',
        },
      ]
    );
  };

  const renderEmpleado = ({ item }: { item: UsuarioRegistrado }) => {
    const roleInfo = ROLE_INFO[item.rol];

    return (
      <TouchableOpacity
        style={styles.empleadoCard}
        onPress={() => {
          setSelectedEmpleado(item);
          setShowEditModal(true);
        }}
      >
        <View style={styles.empleadoHeader}>
          <Text style={styles.roleEmoji}>{roleInfo.emoji}</Text>
          <View style={styles.empleadoInfo}>
            <Text style={styles.empleadoName}>{item.nombre}</Text>
            <Text style={styles.empleadoEmail}>{item.email}</Text>
          </View>
          <View style={[styles.roleBadge, { backgroundColor: roleInfo.color + '20' }]}>
            <Text style={[styles.roleText, { color: roleInfo.color }]}>
              {item.rol}
            </Text>
          </View>
        </View>

        <Text style={styles.roleDescription}>{roleInfo.descripcion}</Text>

        <View style={styles.empleadoActions}>
          <TouchableOpacity
            style={[styles.actionButton, styles.changeRoleButton]}
            onPress={() => setShowEditModal(true)}
          >
            <Text style={styles.actionText}>Cambiar Rol</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.deleteButton]}
            onPress={() => handleDeactivateEmpleado(item.id)}
          >
            <Text style={styles.actionText}>Desactivar</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  if (isLoading && empleados.length === 0) return <Loading fullScreen />;

  return (
    <View style={styles.container}>
      <Header
        title="👥 Gestión de Empleados"
        subtitle={`${empleados.length} empleado(s)`}
        rightAction={{
          label: '+ Agregar',
          onPress: () => setShowAddModal(true),
        }}
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {empleados.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>👤</Text>
            <Text style={styles.emptyText}>Sin empleados registrados</Text>
            <Button
              label="Registrar Primer Empleado"
              onPress={() => setShowAddModal(true)}
              style={styles.emptyButton}
            />
          </View>
        ) : (
          <FlatList
            data={empleados}
            renderItem={renderEmpleado}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            nestedScrollEnabled={false}
            contentContainerStyle={styles.listContent}
          />
        )}

        {/* Información de Roles */}
        <Card style={styles.rolesInfo}>
          <Text style={styles.rolesTitle}>📋 Descripción de Roles</Text>
          {ROLES.map((rol) => (
            <View key={rol} style={styles.roleDescription2}>
              <Text style={styles.roleEmoji2}>{ROLE_INFO[rol].emoji}</Text>
              <View style={styles.roleDescContent}>
                <Text style={styles.roleName}>{rol}</Text>
                <Text style={styles.roleDesc}>{ROLE_INFO[rol].descripcion}</Text>
              </View>
            </View>
          ))}
        </Card>
      </ScrollView>

      {/* Modal Agregar */}
      <Modal visible={showAddModal} onClose={() => setShowAddModal(false)}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Registrar Nuevo Empleado</Text>

          <Input
            label="Nombre Completo"
            placeholder="Juan Pérez"
            value={formData.nombre}
            onChangeText={(v) => setFormData({ ...formData, nombre: v })}
          />

          <Input
            label="Correo Electrónico"
            placeholder="juan@email.com"
            value={formData.email}
            onChangeText={(v) => setFormData({ ...formData, email: v })}
            keyboardType="email-address"
          />

          <Input
            label="Teléfono (Opcional)"
            placeholder="987654321"
            value={formData.telefono}
            onChangeText={(v) => setFormData({ ...formData, telefono: v })}
            keyboardType="phone-pad"
          />

          <Text style={styles.roleSelectorLabel}>Rol</Text>
          <View style={styles.roleSelector}>
            {ROLES.map((rol) => (
              <TouchableOpacity
                key={rol}
                style={[
                  styles.roleOption,
                  formData.rol === rol && styles.roleOptionSelected,
                ]}
                onPress={() => setFormData({ ...formData, rol })}
              >
                <Text style={styles.roleOptionText}>
                  {ROLE_INFO[rol].emoji} {rol}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Button
            label="Registrar Empleado"
            onPress={handleAddEmpleado}
            fullWidth
            loading={isLoading}
            style={styles.registerButton}
          />

          <Button
            label="Cancelar"
            onPress={() => setShowAddModal(false)}
            variant="ghost"
            fullWidth
          />
        </View>
      </Modal>

      {/* Modal Editar */}
      <Modal visible={showEditModal} onClose={() => setShowEditModal(false)}>
        {selectedEmpleado && (
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              Editar: {selectedEmpleado.nombre}
            </Text>

            <Card style={styles.empleadoDetails}>
              <Text style={styles.detailLabel}>Email:</Text>
              <Text style={styles.detailValue}>{selectedEmpleado.email}</Text>

              <Text style={[styles.detailLabel, { marginTop: spacing.md }]}>
                Rol Actual:
              </Text>
              <Text style={styles.detailValue}>{selectedEmpleado.rol}</Text>

              <Text style={[styles.detailLabel, { marginTop: spacing.md }]}>
                Registro:
              </Text>
              <Text style={styles.detailValue}>
                {new Date(selectedEmpleado.fecha_registro).toLocaleDateString('es-PE')}
              </Text>
            </Card>

            <Text style={styles.changRoleTitle}>Cambiar a:</Text>
            <View style={styles.roleSelector}>
              {ROLES.filter((r) => r !== selectedEmpleado.rol).map((rol) => (
                <TouchableOpacity
                  key={rol}
                  style={styles.roleChangeOption}
                  onPress={() => {
                    handleChangeRole(selectedEmpleado.id, rol);
                    setShowEditModal(false);
                  }}
                >
                  <Text style={styles.roleChangeText}>
                    {ROLE_INFO[rol].emoji} {rol}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Button
              label="Cerrar"
              onPress={() => setShowEditModal(false)}
              fullWidth
            />
          </View>
        )}
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
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: spacing.lg,
  },
  emptyText: {
    ...typography.h3,
    color: colors.gray[600],
    marginBottom: spacing.lg,
  },
  emptyButton: {
    minWidth: 200,
  },
  listContent: {
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  empleadoCard: {
    backgroundColor: colors.gray[50],
    borderRadius: 12,
    padding: spacing.lg,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  empleadoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  roleEmoji: {
    fontSize: 28,
    marginRight: spacing.md,
  },
  empleadoInfo: {
    flex: 1,
  },
  empleadoName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.black,
    marginBottom: spacing.sm,
  },
  empleadoEmail: {
    fontSize: 12,
    color: colors.gray[600],
  },
  roleBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 6,
  },
  roleText: {
    fontSize: 11,
    fontWeight: '700',
  },
  roleDescription: {
    fontSize: 12,
    color: colors.gray[600],
    marginBottom: spacing.md,
    fontStyle: 'italic',
  },
  empleadoActions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  actionButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: 8,
    alignItems: 'center',
  },
  changeRoleButton: {
    backgroundColor: colors.primary + '20',
  },
  deleteButton: {
    backgroundColor: colors.error + '20',
  },
  actionText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.black,
  },
  rolesInfo: {
    marginTop: spacing.lg,
  },
  rolesTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.black,
    marginBottom: spacing.lg,
  },
  roleDescription2: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  roleEmoji2: {
    fontSize: 24,
    marginRight: spacing.md,
  },
  roleDescContent: {
    flex: 1,
  },
  roleName: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.black,
    marginBottom: spacing.sm,
  },
  roleDesc: {
    fontSize: 12,
    color: colors.gray[600],
  },
  modalContent: {
    padding: spacing.lg,
  },
  modalTitle: {
    ...typography.h3,
    marginBottom: spacing.lg,
    color: colors.black,
  },
  roleSelectorLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.gray[700],
    marginBottom: spacing.md,
    marginTop: spacing.lg,
  },
  roleSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  roleOption: {
    flex: 1,
    minWidth: '45%',
    paddingVertical: spacing.md,
    borderRadius: 8,
    backgroundColor: colors.gray[100],
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  roleOptionSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  roleOptionText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.black,
  },
  registerButton: {
    marginVertical: spacing.lg,
  },
  empleadoDetails: {
    backgroundColor: colors.gray[50],
    marginBottom: spacing.lg,
  },
  detailLabel: {
    fontSize: 12,
    color: colors.gray[600],
    marginBottom: spacing.sm,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.black,
  },
  changRoleTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.gray[700],
    marginBottom: spacing.md,
  },
  roleChangeOption: {
    flex: 1,
    minWidth: '45%',
    paddingVertical: spacing.md,
    borderRadius: 8,
    backgroundColor: colors.primary + '20',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  roleChangeText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primary,
  },
});
