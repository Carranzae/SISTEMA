import { supabase } from './client';
import { ROLE_PERMISSIONS, UserRole, UsuarioRegistrado } from '@types/permissions';
import { notificationService } from '@services/notifications/notification.service';

export const usersAdvancedService = {
  // Registrar empleado
  async registerEmployee(
    businessId: string,
    adminId: string,
    empleadoData: {
      nombre: string;
      email: string;
      telefono?: string;
      rol: UserRole;
    }
  ): Promise<UsuarioRegistrado> {
    try {
      const permisos = ROLE_PERMISSIONS[empleadoData.rol].permisos;

      const { data, error } = await supabase
        .from('usuarios')
        .insert([
          {
            negocio_id: businessId,
            nombre: empleadoData.nombre,
            email: empleadoData.email,
            telefono: empleadoData.telefono,
            rol: empleadoData.rol,
            permisos: permisos,
            activo: true,
            fecha_registro: new Date().toISOString(),
          },
        ])
        .select()
        .single();

      if (error) throw error;

      // Notificar al admin
      await notificationService.createNotification(
        adminId,
        businessId,
        'ACCESO_USUARIO',
        '👤 Nuevo Empleado Registrado',
        `${empleadoData.nombre} (${empleadoData.rol}) ha sido registrado`,
        { empleado: empleadoData.nombre, rol: empleadoData.rol },
        'push'
      );

      return data as UsuarioRegistrado;
    } catch (error) {
      throw error;
    }
  },

  // Obtener empleados
  async getEmployees(businessId: string) {
    const { data, error } = await supabase
      .from('usuarios')
      .select('*')
      .eq('negocio_id', businessId)
      .eq('activo', true)
      .order('fecha_registro', { ascending: false });

    if (error) throw error;
    return data as UsuarioRegistrado[];
  },

  // Verificar permiso
  async hasPermission(
    userId: string,
    modulo: string,
    accion: string
  ): Promise<boolean> {
    const { data, error } = await supabase
      .from('usuarios')
      .select('permisos')
      .eq('id', userId)
      .single();

    if (error) return false;

    const usuario = data as any;
    return usuario.permisos?.some(
      (p: any) => p.modulo === modulo && p.accion === accion
    ) || false;
  },

  // Cambiar rol
  async changeRole(
    userId: string,
    nuevoRol: UserRole,
    adminId: string,
    businessId: string
  ) {
    const permisos = ROLE_PERMISSIONS[nuevoRol].permisos;

    const { data, error } = await supabase
      .from('usuarios')
      .update({
        rol: nuevoRol,
        permisos: permisos,
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;

    // Notificar al admin
    await notificationService.createNotification(
      adminId,
      businessId,
      'ACCESO_USUARIO',
      '👤 Rol Actualizado',
      `Se actualizó el rol del empleado a ${nuevoRol}`,
      { usuario: userId, nuevoRol },
      'push'
    );

    return data;
  },

  // Desactivar usuario
  async deactivateUser(userId: string, adminId: string, businessId: string) {
    const { error } = await supabase
      .from('usuarios')
      .update({ activo: false })
      .eq('id', userId);

    if (error) throw error;

    await notificationService.createNotification(
      adminId,
      businessId,
      'ACCESO_USUARIO',
      '🚫 Usuario Desactivado',
      `Un empleado ha sido desactivado`,
      { usuario: userId },
      'push'
    );
  },

  // Registrar acceso
  async logAccess(userId: string, accion: string) {
    const { error } = await supabase
      .from('usuarios')
      .update({ ultimo_acceso: new Date().toISOString() })
      .eq('id', userId);

    if (error) throw error;
  },
};
