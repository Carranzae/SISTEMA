import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Text,
  Alert,
  Share,
  Image,
} from 'react-native';
import { Header, Button, Modal, Input, Card, Loading } from '@components/common';
import { colors, spacing, typography } from '@theme/index';
import { useBusiness } from '@hooks/useBusiness';
import * as FileSystem from 'expo-file-system';

interface MarketplaceLink {
  id: string;
  codigo: string;
  enlace: string;
  qr_code: string;
  nombre: string;
  estado: string;
  visitas: number;
  fecha_expiracion: string;
}

export default function PublishMarketplaceScreen() {
  const { business } = useBusiness();
  const [links, setLinks] = useState<MarketplaceLink[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedLink, setSelectedLink] = useState<MarketplaceLink | null>(null);
  const [showQRModal, setShowQRModal] = useState(false);

  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    vigencia_dias: '30',
  });

  useEffect(() => {
    loadMarketplaceLinks();
  }, [business]);

  const loadMarketplaceLinks = async () => {
    if (!business) return;
    setIsLoading(true);
    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/api/v1/marketplace/links/${business.id}`
      );
      const result = await response.json();
      if (result.success) {
        setLinks(result.links);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateLink = async () => {
    if (!formData.nombre.trim() || !formData.descripcion.trim() || !business) {
      Alert.alert('Error', 'Completa todos los campos');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/api/v1/marketplace/links/create`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            negocio_id: business.id,
            nombre: formData.nombre,
            descripcion: formData.descripcion,
            vigencia_dias: parseInt(formData.vigencia_dias),
          }),
        }
      );

      const result = await response.json();
      if (result.success) {
        setLinks([...links, result.link]);
        setFormData({ nombre: '', descripcion: '', vigencia_dias: '30' });
        setShowCreateModal(false);
        Alert.alert('✅ Éxito', 'Enlace de marketplace creado');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleShareLink = async (link: MarketplaceLink) => {
    try {
      await Share.share({
        message: `¡Mira mis productos en ${link.nombre}!\n${link.enlace}`,
        title: 'Marketplace',
        url: link.enlace,
      });
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleDownloadQR = async (link: MarketplaceLink) => {
    try {
      const fileName = `qr_${link.codigo}.png`;
      const path = `${FileSystem.cacheDirectory}${fileName}`;

      await FileSystem.writeAsStringAsync(
        path,
        link.qr_code.replace('data:image/png;base64,', ''),
        { encoding: FileSystem.EncodingType.Base64 }
      );

      Alert.alert('✅ Descargado', `QR guardado como ${fileName}`);
    } catch (error) {
      Alert.alert('Error', 'No se pudo descargar el QR');
    }
  };

  const handleDeleteLink = async (linkId: string) => {
    Alert.alert(
      'Confirmar',
      '¿Desactivar este enlace?',
      [
        { text: 'Cancelar' },
        {
          text: 'Desactivar',
          onPress: async () => {
            try {
              await fetch(
                `${process.env.EXPO_PUBLIC_API_URL}/api/v1/marketplace/links/${linkId}`,
                { method: 'DELETE' }
              );
              setLinks(links.filter((l) => l.id !== linkId));
              Alert.alert('✅ Éxito', 'Enlace desactivado');
            } catch (error) {
              Alert.alert('Error', 'No se pudo desactivar');
            }
          },
        },
      ]
    );
  };

  if (isLoading && links.length === 0) return <Loading fullScreen />;

  return (
    <View style={styles.container}>
      <Header
        title="🛒 Publicar Marketplace"
        subtitle="Comparte tu tienda virtual"
        rightAction={{
          label: '+ Nuevo',
          onPress: () => setShowCreateModal(true),
        }}
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {links.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>🏪</Text>
            <Text style={styles.emptyText}>Sin enlaces de marketplace</Text>
            <Button
              label="Crear Primer Enlace"
              onPress={() => setShowCreateModal(true)}
              style={styles.emptyButton}
            />
          </View>
        ) : (
          links.map((link) => (
            <Card key={link.id} style={styles.linkCard}>
              <View style={styles.linkHeader}>
                <View style={styles.linkInfo}>
                  <Text style={styles.linkName}>{link.nombre}</Text>
                  <Text style={styles.linkCode}>Código: {link.codigo}</Text>
                </View>
                <View
                  style={[
                    styles.statusBadge,
                    link.estado === 'ACTIVO'
                      ? styles.statusActive
                      : styles.statusInactive,
                  ]}
                >
                  <Text style={styles.statusText}>{link.estado}</Text>
                </View>
              </View>

              <Text style={styles.linkDescription}>{link.descripcion}</Text>

              <View style={styles.stats}>
                <StatBox label="Visitas" value={link.visitas} emoji="👁️" />
                <StatBox
                  label="Expira"
                  value={new Date(link.fecha_expiracion).toLocaleDateString(
                    'es-PE'
                  )}
                  emoji="⏰"
                />
              </View>

              <View style={styles.actions}>
                <TouchableOpacity
                  style={[styles.actionButton, styles.qrButton]}
                  onPress={() => {
                    setSelectedLink(link);
                    setShowQRModal(true);
                  }}
                >
                  <Text style={styles.actionText}>📱 QR</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.actionButton, styles.shareButton]}
                  onPress={() => handleShareLink(link)}
                >
                  <Text style={styles.actionText}>📤 Compartir</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.actionButton, styles.deleteButton]}
                  onPress={() => handleDeleteLink(link.id)}
                >
                  <Text style={styles.actionText}>❌ Desactivar</Text>
                </TouchableOpacity>
              </View>

              <Card style={styles.linkPreview}>
                <Text style={styles.linkURL}>{link.enlace}</Text>
              </Card>
            </Card>
          ))
        )}
      </ScrollView>

      {/* Modal Crear */}
      <Modal visible={showCreateModal} onClose={() => setShowCreateModal(false)}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Nuevo Enlace de Marketplace</Text>

          <Input
            label="Nombre de la Tienda"
            placeholder="Ej: Tienda de Ropa Premium"
            value={formData.nombre}
            onChangeText={(v) => setFormData({ ...formData, nombre: v })}
          />

          <Input
            label="Descripción"
            placeholder="Describe tu tienda"
            value={formData.descripcion}
            onChangeText={(v) => setFormData({ ...formData, descripcion: v })}
            multiline
          />

          <Input
            label="Días de Vigencia"
            placeholder="30"
            value={formData.vigencia_dias}
            onChangeText={(v) => setFormData({ ...formData, vigencia_dias: v })}
            keyboardType="numeric"
          />

          <Button
            label="Crear Enlace"
            onPress={handleCreateLink}
            fullWidth
            loading={isLoading}
            style={styles.createButton}
          />

          <Button
            label="Cancelar"
            onPress={() => setShowCreateModal(false)}
            variant="ghost"
            fullWidth
          />
        </View>
      </Modal>

      {/* Modal QR */}
      <Modal visible={showQRModal} onClose={() => setShowQRModal(false)}>
        {selectedLink && (
          <View style={styles.qrModal}>
            <Text style={styles.qrTitle}>Código QR - {selectedLink.nombre}</Text>

            <View style={styles.qrContainer}>
              <Image
                source={{ uri: selectedLink.qr_code }}
                style={styles.qrImage}
              />
            </View>

            <Card style={styles.qrInfo}>
              <Text style={styles.qrInfoLabel}>Enlace:</Text>
              <Text style={styles.qrInfoValue}>{selectedLink.enlace}</Text>
            </Card>

            <View style={styles.qrActions}>
              <Button
                label="📥 Descargar QR"
                onPress={() => {
                  handleDownloadQR(selectedLink);
                  setShowQRModal(false);
                }}
                fullWidth
                style={styles.qrActionButton}
              />

              <Button
                label="📤 Compartir QR"
                onPress={() => {
                  handleShareLink(selectedLink);
                  setShowQRModal(false);
                }}
                variant="secondary"
                fullWidth
              />
            </View>

            <Button
              label="Cerrar"
              onPress={() => setShowQRModal(false)}
              variant="ghost"
              fullWidth
            />
          </View>
        )}
      </Modal>
    </View>
  );
}

interface StatBoxProps {
  label: string;
  value: string | number;
  emoji: string;
}

const StatBox: React.FC<StatBoxProps> = ({ label, value, emoji }) => (
  <View style={styles.statBox}>
    <Text style={styles.statEmoji}>{emoji}</Text>
    <Text style={styles.statLabel}>{label}</Text>
    <Text style={styles.statValue}>{value}</Text>
  </View>
);

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
  linkCard: {
    marginBottom: spacing.lg,
  },
  linkHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  linkInfo: {
    flex: 1,
  },
  linkName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.black,
    marginBottom: spacing.sm,
  },
  linkCode: {
    fontSize: 12,
    color: colors.gray[600],
  },
  statusBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 6,
  },
  statusActive: {
    backgroundColor: colors.success + '20',
  },
  statusInactive: {
    backgroundColor: colors.error + '20',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.black,
  },
  linkDescription: {
    fontSize: 13,
    color: colors.gray[700],
    marginBottom: spacing.md,
  },
  stats: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  statBox: {
    flex: 1,
    backgroundColor: colors.gray[50],
    borderRadius: 8,
    padding: spacing.md,
    alignItems: 'center',
  },
  statEmoji: {
    fontSize: 20,
    marginBottom: spacing.sm,
  },
  statLabel: {
    fontSize: 11,
    color: colors.gray[600],
    marginBottom: spacing.sm,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  actionButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: 8,
    alignItems: 'center',
  },
  qrButton: {
    backgroundColor: colors.info + '20',
  },
  shareButton: {
    backgroundColor: colors.primary + '20',
  },
  deleteButton: {
    backgroundColor: colors.error + '20',
  },
  actionText: {
    fontSize: 12,
    fontWeight: '600',
  },
  linkPreview: {
    backgroundColor: colors.gray[50],
  },
  linkURL: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '500',
  },
  modalContent: {
    padding: spacing.lg,
  },
  modalTitle: {
    ...typography.h3,
    marginBottom: spacing.lg,
    color: colors.black,
  },
  createButton: {
    marginVertical: spacing.lg,
  },
  qrModal: {
    flex: 1,
    padding: spacing.lg,
    backgroundColor: colors.white,
  },
  qrTitle: {
    ...typography.h3,
    marginBottom: spacing.lg,
    color: colors.black,
  },
  qrContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.gray[50],
    borderRadius: 12,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  qrImage: {
    width: 250,
    height: 250,
  },
  qrInfo: {
    marginBottom: spacing.lg,
  },
  qrInfoLabel: {
    fontSize: 12,
    color: colors.gray[600],
    marginBottom: spacing.sm,
  },
  qrInfoValue: {
    fontSize: 13,
    color: colors.primary,
    fontWeight: '600',
  },
  qrActions: {
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  qrActionButton: {
    marginBottom: spacing.md,
  },
});
