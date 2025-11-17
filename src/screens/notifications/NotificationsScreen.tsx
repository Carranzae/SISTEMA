import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Text,
  FlatList,
  RefreshControl,
} from 'react-native';
import { Header, Button, Card, Loading } from '@components/common';
import { colors, spacing, typography } from '@theme/index';
import { useAuthStore } from '@store/auth.store';
import { notificationService } from '@services/notifications/notification.service';
import { formatDate } from '@utils/formatters';
import type { NotificationData } from '@services/notifications/notification.service';

export default function NotificationsScreen() {
  const { user } = useAuthStore();
  const [notificaciones, setNotificaciones] = useState<NotificationData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'todas' | 'no_leidas'>('todas');

  useEffect(() => {
    loadNotificaciones();
  }, [user]);

  const loadNotificaciones = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const data = await notificationService.getNotifications(user.id, 50);
      setNotificaciones(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadNotificaciones();
    setRefreshing(false);
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await notificationService.markAsRead(notificationId);
      setNotificaciones(
        notificaciones.map((n) =>
          n.id === notificationId ? { ...n, leido: true } : n
        )
      );
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const filteredNotificaciones = notificaciones.filter((n) =>
    filter === 'no_leidas' ? !n.leido : true
  );

  const getIconByType = (tipo: string): string => {
    switch (tipo) {
      case 'VENTA_GRANDE':
        return '💰';
      case 'INVENTARIO_BAJO':
        return '📉';
      case 'CAMBIO_CAJA':
        return '💵';
      case 'ACCESO_USUARIO':
        return '👤';
      case 'MODIFICACION_MASIVA':
        return '🔄';
      default:
        return '📢';
    }
  };

  const getColorByType = (tipo: string): string => {
    switch (tipo) {
      case 'VENTA_GRANDE':
        return colors.success;
      case 'INVENTARIO_BAJO':
        return colors.warning;
      case 'CAMBIO_CAJA':
        return colors.primary;
      case 'ACCESO_USUARIO':
        return colors.info;
      case 'MODIFICACION_MASIVA':
        return colors.secondary;
      default:
        return colors.gray[600];
    }
  };

  const renderNotification = ({ item }: { item: NotificationData }) => (
    <TouchableOpacity
      style={[
        styles.notificationCard,
        !item.leido && styles.notificationCardUnread,
      ]}
      onPress={() => handleMarkAsRead(item.id)}
    >
      <View style={styles.notificationHeader}>
        <Text style={styles.notificationIcon}>
          {getIconByType(item.tipo)}
        </Text>
        <View style={styles.notificationContent}>
          <Text style={styles.notificationTitle}>{item.titulo}</Text>
          <Text style={styles.notificationDescription}>
            {item.descripcion}
          </Text>
        </View>
        {!item.leido && (
          <View style={[styles.unreadBadge, { backgroundColor: getColorByType(item.tipo) }]} />
        )}
      </View>

      <Text style={styles.notificationTime}>
        {formatDate(item.fecha)}
      </Text>
    </TouchableOpacity>
  );

  if (isLoading && notificaciones.length === 0) return <Loading fullScreen />;

  const noReadCount = notificaciones.filter((n) => !n.leido).length;

  return (
    <View style={styles.container}>
      <Header
        title="🔔 Notificaciones"
        subtitle={noReadCount > 0 ? `${noReadCount} no leídas` : 'Al día'}
      />

      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[
            styles.filterButton,
            filter === 'todas' && styles.filterButtonActive,
          ]}
          onPress={() => setFilter('todas')}
        >
          <Text
            style={[
              styles.filterText,
              filter === 'todas' && styles.filterTextActive,
            ]}
          >
            Todas ({notificaciones.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filterButton,
            filter === 'no_leidas' && styles.filterButtonActive,
          ]}
          onPress={() => setFilter('no_leidas')}
        >
          <Text
            style={[
              styles.filterText,
              filter === 'no_leidas' && styles.filterTextActive,
            ]}
          >
            No Leídas ({noReadCount})
          </Text>
        </TouchableOpacity>
      </View>

      {filteredNotificaciones.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyEmoji}>📭</Text>
          <Text style={styles.emptyText}>
            {filter === 'no_leidas'
              ? 'Sin notificaciones sin leer'
              : 'Sin notificaciones'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredNotificaciones}
          renderItem={renderNotification}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={[colors.primary]}
            />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  filterButton: {
    flex: 1,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: 8,
    backgroundColor: colors.gray[100],
    alignItems: 'center',
  },
  filterButtonActive: {
    backgroundColor: colors.primary,
  },
  filterText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.gray[700],
  },
  filterTextActive: {
    color: colors.white,
  },
  listContent: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  notificationCard: {
    backgroundColor: colors.gray[50],
    borderRadius: 12,
    padding: spacing.lg,
    borderLeftWidth: 4,
    borderLeftColor: colors.gray[300],
  },
  notificationCardUnread: {
    backgroundColor: colors.blue[50],
    borderLeftColor: colors.primary,
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  notificationIcon: {
    fontSize: 24,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.black,
    marginBottom: spacing.sm,
  },
  notificationDescription: {
    fontSize: 13,
    color: colors.gray[600],
    lineHeight: 18,
  },
  unreadBadge: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginTop: spacing.sm,
  },
  notificationTime: {
    fontSize: 11,
    color: colors.gray[500],
  },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: spacing.lg,
  },
  emptyText: {
    fontSize: 16,
    color: colors.gray[600],
  },
});
