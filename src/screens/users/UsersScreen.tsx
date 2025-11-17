import React, { useState, useEffect } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Text,
  Alert,
} from 'react-native';
import { Header, Button, Modal, Input, Card, Loading } from '@components/common';
import { colors, spacing, typography } from '@theme/index';
import { useBusiness } from '@hooks/useBusiness';
import { useAuthStore } from '@store/auth.store';
import { ROLES_USUARIO } from '@utils/constants';
import { usersService } from '@services/supabase/users.service';
import type { Usuario } from '@types/database';

export default function UsersScreen() {
  const { business } = useBusiness();
  const { user: currentUser } = useAuthStore();

  const [users, setUsers] = useState<Usuario[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<Usuario | null>(null);
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    rol: 'VENDEDOR',
  });

  useEffect(() => {
    loadUsers();
  }, [business]);

  const loadUsers = async () => {
    if (!business) return;
    setIsLoading(true);
    try {
      const data = await usersService.getUsers(business.id);
      setUsers(data);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveUser = async () => {
    if (!formData.nombre.trim()) {
      Alert.alert('Error', 'El nombre es requerido');
      return;
    }

    if (!business || !currentUser) return;

    try {
      if (selectedUser) {
        await usersService.updateUser(selectedUser.id, {
          nombre: formData.nombre,
          email: formData.email,
          rol: formData.rol as any,
        });
      } else {
        await usersService.createUser(business.id, {
          nombre: formData.nombre,
          email: formData.email,
          rol: formData.rol as any,
        }, currentUser.id);
      }

      Alert.alert('✅ Éxito', 'Usuario guardado correctamente');
      resetForm();
      setShowAddModal(false);
      loadUsers();
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    Alert.alert(
      'Confirmar',
      '¿Deseas eliminar este usuario?',
      [
        { text: 'Cancelar' },
        {
          text: 'Eliminar',
          onPress: async () => {
            try {
              await usersService.deactivateUser(userId);
              Alert.alert('✅ Éxito', 'Usuario eliminado');
              loadUsers();
            } catch (error: any) {
              Alert.alert('Error', error.message);
            }
          },
          style: 'destructive',
        },
      ]
    );
  };

  const resetForm = () => {
    setFormData({ nombre: '', email: '', rol: 'VENDEDOR' });
    setSelectedUser(null);
  };

  const renderUser = ({ item }: { item: Usuario }) => (
    <Card style={styles.userCard}>
      <View style={styles.userHeader}>
        <View>
          <Text style={styles.userName}>{item.nombre}</Text>
          <Text style={styles.userEmail}>{item.email || 'Sin email'}</Text>
        </View>
        <View style={[styles.rolBadge, getRolBadgeStyle(item.rol)]}>
          <Text style={styles.rolBadgeText}>{item.rol}</Text>
        </View>
      </View>

      <View style={styles.userActions}>
        <TouchableOpacity
          style={[styles.actionButton, styles.editButton]}
          onPress={() => {
            setSelectedUser(item);
            setFormData({
              nombre: item.nombre,
              email: item.email || '',
              rol: item.rol,
            });
            setShowAddModal(true);
          }}
        >
          <Text style={styles.actionText}>✏️ Editar</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => handleDeleteUser(item.id)}
        >
          <Text style={styles.actionText}>🗑️ Eliminar</Text>
        </TouchableOpacity>
      </View>
    </Card>
  );

  if (isLoading) return <Loading fullScreen />;

  return (
    <View style={styles.container}>
      <Header
        title="👥 Usuarios"
        subtitle={`${users.length} usuario(s) activo(s)`}
        rightAction={{
          label: '+ Nuevo',
          onPress: () => {
            resetForm();
            setShowAddModal(true);
          },
        }}
      />

      {users.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyEmoji}>👤</Text>
          <Text style={styles.emptyText}>No hay usuarios</Text>
          <Button
            label="Agregar Primer Usuario"
            onPress={() => setShowAddModal(true)}
            style={styles.emptyButton}
          />
        </View>
      ) : (
        <FlatList
          data={users}
          renderItem={renderUser}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
        />
      )}

      {/* Modal Agregar/Editar Usuario */}
      <Modal visible={showAddModal} onClose={() => setShowAddModal(false)}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>
            {selectedUser ? 'Editar Usuario' : 'Nuevo Usuario'}
          </Text>

          <Input
            label="Nombre Completo *"
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

          <View style={styles.rolSelector}>
            <Text style={styles.rolLabel}>Rol de Usuario *</Text>
            {ROLES_USUARIO.map((role) => (
              <TouchableOpacity
                key={role.value}
                style={[
                  styles.rolOption,
                  formData.rol === role.value && styles.rolOptionSelected,
                ]}
                onPress={() => setFormData({ ...formData, rol: role.value })}
              >
                <Text style={styles.rolOptionText}>{role.label}</Text>
                {formData.rol === role.value && (
                  <Text style={styles.checkmark}>✓</Text>
                )}
              </TouchableOpacity>
            ))}
          </View>

          <Button
            label="Guardar Usuario"
            onPress={handleSaveUser}
            fullWidth
            loading={isLoading}
            style={styles.saveButton}
          />

          <Button
            label="Cancelar"
            onPress={() => setShowAddModal(false)}
            variant="ghost"
            fullWidth
          />
        </View>
      </Modal>
    </View>
  );
}

const getRolBadgeStyle = (rol: string) => {
  switch (rol) {
    case 'ADMINISTRADOR':
      return { backgroundColor: colors.primary + '20' };
    case 'VENDEDOR':
      return { backgroundColor: colors.success + '20' };
    case 'ALMACENERO':
      return { backgroundColor: colors.warning + '20' };
    case 'CONTADOR':
      return { backgroundColor: colors.info + '20' };
    default:
      return { backgroundColor: colors.gray[200] };
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  list: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  userCard: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  userHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  userName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.black,
    marginBottom: spacing.sm,
  },
  userEmail: {
    fontSize: 12,
    color: colors.gray[600],
  },
  rolBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 6,
  },
  rolBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.black,
  },
  userActions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  actionButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: 6,
    alignItems: 'center',
  },
  editButton: {
    backgroundColor: colors.primary + '20',
  },
  deleteButton: {
    backgroundColor: colors.error + '20',
  },
  actionText: {
    fontSize: 12,
    fontWeight: '600',
  },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
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
  modalContent: {
    padding: spacing.lg,
  },
  modalTitle: {
    ...typography.h3,
    marginBottom: spacing.lg,
    color: colors.black,
  },
  rolSelector: {
    marginBottom: spacing.lg,
  },
  rolLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.gray[700],
    marginBottom: spacing.md,
  },
  rolOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    marginBottom: spacing.sm,
    backgroundColor: colors.gray[50],
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  rolOptionSelected: {
    backgroundColor: colors.primary + '15',
    borderColor: colors.primary,
  },
  rolOptionText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.black,
  },
  checkmark: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: '700',
  },
  saveButton: {
    marginVertical: spacing.lg,
  },
});
