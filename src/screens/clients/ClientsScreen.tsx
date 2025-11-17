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
import { supabase } from '@services/supabase/client';
import type { Cliente } from '@types/database';

export default function ClientsScreen() {
  const { business } = useBusiness();
  const [clients, setClients] = useState<Cliente[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Cliente | null>(null);
  const [formData, setFormData] = useState({
    nombre: '',
    numero_documento: '',
    email: '',
    telefono: '',
    direccion: '',
    tipo_cliente: 'CONSUMIDOR_FINAL',
  });

  useEffect(() => {
    loadClients();
  }, [business]);

  const loadClients = async () => {
    if (!business) return;
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('clientes')
        .select('*')
        .eq('negocio_id', business.id)
        .eq('activo', true);

      if (error) throw error;
      setClients(data || []);
    } catch (error) {
      console.error('Error loading clients:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveClient = async () => {
    if (!formData.nombre.trim()) {
      Alert.alert('Error', 'El nombre es requerido');
      return;
    }

    if (!business) return;

    try {
      if (selectedClient) {
        const { error } = await supabase
          .from('clientes')
          .update(formData)
          .eq('id', selectedClient.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('clientes')
          .insert([{ negocio_id: business.id, ...formData }]);

        if (error) throw error;
      }

      Alert.alert('✅ Éxito', 'Cliente guardado correctamente');
      resetForm();
      setShowAddModal(false);
      loadClients();
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  const handleDeleteClient = async (clientId: string) => {
    Alert.alert(
      'Confirmar',
      '¿Deseas eliminar este cliente?',
      [
        { text: 'Cancelar' },
        {
          text: 'Eliminar',
          onPress: async () => {
            try {
              const { error } = await supabase
                .from('clientes')
                .update({ activo: false })
                .eq('id', clientId);

              if (error) throw error;
              Alert.alert('✅ Éxito', 'Cliente eliminado');
              loadClients();
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
    setFormData({
      nombre: '',
      numero_documento: '',
      email: '',
      telefono: '',
      direccion: '',
      tipo_cliente: 'CONSUMIDOR_FINAL',
    });
    setSelectedClient(null);
  };

  const renderClient = ({ item }: { item: Cliente }) => (
    <Card style={styles.clientCard}>
      <View style={styles.clientHeader}>
        <View>
          <Text style={styles.clientName}>{item.nombre}</Text>
          <Text style={styles.clientType}>{item.tipo_cliente}</Text>
        </View>
        <Text style={styles.clientDocument}>
          {item.numero_documento || 'Sin DNI'}
        </Text>
      </View>

      <View style={styles.clientInfo}>
        {item.telefono && (
          <Text style={styles.infoText}>📱 {item.telefono}</Text>
        )}
        {item.email && (
          <Text style={styles.infoText}>📧 {item.email}</Text>
        )}
        {item.direccion && (
          <Text style={styles.infoText}>📍 {item.direccion}</Text>
        )}
      </View>

      <View style={styles.clientActions}>
        <TouchableOpacity
          style={[styles.actionButton, styles.editButton]}
          onPress={() => {
            setSelectedClient(item);
            setFormData({
              nombre: item.nombre,
              numero_documento: item.numero_documento || '',
              email: item.email || '',
              telefono: item.telefono || '',
              direccion: item.direccion || '',
              tipo_cliente: item.tipo_cliente,
            });
            setShowAddModal(true);
          }}
        >
          <Text style={styles.actionText}>✏️ Editar</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => handleDeleteClient(item.id)}
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
        title="👫 Clientes"
        subtitle={`${clients.length} cliente(s)`}
        rightAction={{
          label: '+ Nuevo',
          onPress: () => {
            resetForm();
            setShowAddModal(true);
          },
        }}
      />

      {clients.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyEmoji}>👤</Text>
          <Text style={styles.emptyText}>No hay clientes registrados</Text>
          <Button
            label="Agregar Primer Cliente"
            onPress={() => setShowAddModal(true)}
            style={styles.emptyButton}
          />
        </View>
      ) : (
        <FlatList
          data={clients}
          renderItem={renderClient}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
        />
      )}

      {/* Modal Agregar/Editar Cliente */}
      <Modal visible={showAddModal} onClose={() => setShowAddModal(false)}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>
            {selectedClient ? 'Editar Cliente' : 'Nuevo Cliente'}
          </Text>

          <Input
            label="Nombre o Razón Social *"
            placeholder="Juan Pérez o Empresa S.A.C"
            value={formData.nombre}
            onChangeText={(v) => setFormData({ ...formData, nombre: v })}
          />

          <Input
            label="DNI / RUC"
            placeholder="12345678 o 20123456789"
            value={formData.numero_documento}
            onChangeText={(v) =>
              setFormData({ ...formData, numero_documento: v })
            }
            keyboardType="numeric"
          />

          <Input
            label="Correo Electrónico"
            placeholder="cliente@email.com"
            value={formData.email}
            onChangeText={(v) => setFormData({ ...formData, email: v })}
            keyboardType="email-address"
          />

          <Input
            label="Teléfono"
            placeholder="987654321"
            value={formData.telefono}
            onChangeText={(v) => setFormData({ ...formData, telefono: v })}
            keyboardType="phone-pad"
          />

          <Input
            label="Dirección"
            placeholder="Jr. Principal 123, Distrito"
            value={formData.direccion}
            onChangeText={(v) => setFormData({ ...formData, direccion: v })}
            multiline
          />

          <Button
            label="Guardar Cliente"
            onPress={handleSaveClient}
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  list: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  clientCard: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  clientHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  clientName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.black,
    marginBottom: spacing.sm,
  },
  clientType: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '600',
  },
  clientDocument: {
    fontSize: 12,
    color: colors.gray[600],
  },
  clientInfo: {
    backgroundColor: colors.gray[50],
    borderRadius: 6,
    padding: spacing.md,
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  infoText: {
    fontSize: 12,
    color: colors.gray[700],
  },
  clientActions: {
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
  saveButton: {
    marginVertical: spacing.lg,
  },
});
