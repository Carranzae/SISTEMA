import { supabase } from '@services/supabase/client';
import * as Notifications from 'expo-notifications';

export interface NotificationData {
  id: string;
  usuario_id: string;
  negocio_id: string;
  tipo: 'VENTA_GRANDE' | 'INVENTARIO_BAJO' | 'CAMBIO_CAJA' | 'ACCESO_USUARIO' | 'MODIFICACION_MASIVA';
  titulo: string;
  descripcion: string;
  datos: Record<string, any>;
  leido: boolean;
  fecha: string;
  canal: 'push' | 'email' | 'ambos';
}

export const notificationService = {
  // Crear notificación
  async createNotification(
    userId: string,
    businessId: string,
    tipo: NotificationData['tipo'],
    titulo: string,
    descripcion: string,
    datos: Record<string, any>,
    canal: 'push' | 'email' | 'ambos' = 'ambos'
  ): Promise<NotificationData> {
    const { data, error } = await supabase
      .from('notificaciones')
      .insert([
        {
          usuario_id: userId,
          negocio_id: businessId,
          tipo,
          titulo,
          descripcion,
          datos,
          leido: false,
          fecha: new Date().toISOString(),
          canal,
        },
      ])
      .select()
      .single();

    if (error) throw error;

    // Enviar notificación push si está habilitada
    if (canal === 'push' || canal === 'ambos') {
      await this.sendPushNotification(userId, titulo, descripcion);
    }

    // Enviar email si está habilitado
    if (canal === 'email' || canal === 'ambos') {
      await this.sendEmailNotification(userId, titulo, descripcion);
    }

    return data as NotificationData;
  },

  // Enviar notificación push
  async sendPushNotification(
    userId: string,
    titulo: string,
    descripcion: string
  ) {
    try {
      // Obtener token del usuario
      const { data: userData } = await supabase
        .from('usuarios')
        .select('push_token')
        .eq('id', userId)
        .single();

      if (userData?.push_token) {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: titulo,
            body: descripcion,
            badge: 1,
          },
          trigger: { seconds: 1 },
        });
      }
    } catch (error) {
      console.error('Error sending push:', error);
    }
  },

  // Enviar email
  async sendEmailNotification(
    userId: string,
    titulo: string,
    descripcion: string
  ) {
    try {
      const { data: userData } = await supabase
        .from('usuarios')
        .select('email, nombre')
        .eq('id', userId)
        .single();

      if (userData?.email) {
        await fetch(
          `${process.env.EXPO_PUBLIC_API_URL}/api/v1/notifications/email`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              to: userData.email,
              subject: titulo,
              message: descripcion,
              nombre: userData.nombre,
            }),
          }
        );
      }
    } catch (error) {
      console.error('Error sending email:', error);
    }
  },

  // Obtener notificaciones
  async getNotifications(userId: string, limit: number = 20) {
    const { data, error } = await supabase
      .from('notificaciones')
      .select('*')
      .eq('usuario_id', userId)
      .order('fecha', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data as NotificationData[];
  },

  // Marcar como leído
  async markAsRead(notificationId: string) {
    const { error } = await supabase
      .from('notificaciones')
      .update({ leido: true })
      .eq('id', notificationId);

    if (error) throw error;
  },

  // Notificar venta grande
  async notifyLargeSale(businessId: string, adminId: string, monto: number, cliente: string) {
    await this.createNotification(
      adminId,
      businessId,
      'VENTA_GRANDE',
      `💰 Venta Grande`,
      `Se realizó una venta de S/ ${monto.toFixed(2)} de ${cliente}`,
      { monto, cliente },
      'ambos'
    );
  },

  // Notificar stock bajo
  async notifyLowStock(businessId: string, adminId: string, producto: string, stock: number) {
    await this.createNotification(
      adminId,
      businessId,
      'INVENTARIO_BAJO',
      `📉 Stock Bajo`,
      `El producto "${producto}" tiene solo ${stock} unidades`,
      { producto, stock },
      'ambos'
    );
  },

  // Notificar cambios de caja
  async notifyBoxMovement(
    businessId: string,
    adminId: string,
    tipo: string,
    monto: number
  ) {
    await this.createNotification(
      adminId,
      businessId,
      'CAMBIO_CAJA',
      `💰 Movimiento de Caja`,
      `Se registró un ${tipo} de S/ ${monto.toFixed(2)}`,
      { tipo, monto },
      'push'
    );
  },

  // Notificar acceso de usuario
  async notifyUserAccess(businessId: string, adminId: string, usuario: string, accion: string) {
    await this.createNotification(
      adminId,
      businessId,
      'ACCESO_USUARIO',
      `👤 Acceso de Usuario`,
      `${usuario} realizó: ${accion}`,
      { usuario, accion },
      'push'
    );
  },

  // Notificar modificación masiva
  async notifyBulkModification(
    businessId: string,
    adminId: string,
    cantidad: number,
    tipo: string
  ) {
    await this.createNotification(
      adminId,
      businessId,
      'MODIFICACION_MASIVA',
      `🔄 Modificación Masiva`,
      `Se modificaron ${cantidad} registros de ${tipo}`,
      { cantidad, tipo },
      'ambos'
    );
  },
};
