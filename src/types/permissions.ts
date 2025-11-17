export type UserRole = 'ADMIN' | 'VENDEDOR' | 'CAJERO' | 'ALMACENERO' | 'CONTADOR';

export interface Permission {
  id: string;
  modulo: string;
  accion: string; // 'ver', 'crear', 'editar', 'eliminar', 'exportar'
}

export interface RolePermission {
  rol: UserRole;
  permisos: Permission[];
}

export const ROLE_PERMISSIONS: Record<UserRole, RolePermission> = {
  ADMIN: {
    rol: 'ADMIN',
    permisos: [
      // Dashboard
      { id: 'dashboard_ver', modulo: 'dashboard', accion: 'ver' },
      
      // POS
      { id: 'pos_ver', modulo: 'pos', accion: 'ver' },
      { id: 'pos_crear', modulo: 'pos', accion: 'crear' },
      
      // Inventario
      { id: 'inventario_ver', modulo: 'inventario', accion: 'ver' },
      { id: 'inventario_crear', modulo: 'inventario', accion: 'crear' },
      { id: 'inventario_editar', modulo: 'inventario', accion: 'editar' },
      { id: 'inventario_eliminar', modulo: 'inventario', accion: 'eliminar' },
      { id: 'inventario_exportar', modulo: 'inventario', accion: 'exportar' },
      
      // Caja
      { id: 'caja_ver', modulo: 'caja', accion: 'ver' },
      { id: 'caja_abrir', modulo: 'caja', accion: 'crear' },
      { id: 'caja_cerrar', modulo: 'caja', accion: 'editar' },
      
      // Reportes
      { id: 'reportes_ver', modulo: 'reportes', accion: 'ver' },
      { id: 'reportes_exportar', modulo: 'reportes', accion: 'exportar' },
      
      // Usuarios
      { id: 'usuarios_ver', modulo: 'usuarios', accion: 'ver' },
      { id: 'usuarios_crear', modulo: 'usuarios', accion: 'crear' },
      { id: 'usuarios_editar', modulo: 'usuarios', accion: 'editar' },
      { id: 'usuarios_eliminar', modulo: 'usuarios', accion: 'eliminar' },
      
      // Configuración
      { id: 'config_ver', modulo: 'configuracion', accion: 'ver' },
      { id: 'config_editar', modulo: 'configuracion', accion: 'editar' },
      
      // Ropa (si aplica)
      { id: 'ropa_ver', modulo: 'ropa', accion: 'ver' },
      { id: 'ropa_crear', modulo: 'ropa', accion: 'crear' },
      { id: 'ropa_editar', modulo: 'ropa', accion: 'editar' },
      { id: 'ropa_eliminar', modulo: 'ropa', accion: 'eliminar' },
      { id: 'ropa_marketplace', modulo: 'ropa', accion: 'ver' },
    ],
  },

  VENDEDOR: {
    rol: 'VENDEDOR',
    permisos: [
      { id: 'dashboard_ver', modulo: 'dashboard', accion: 'ver' },
      { id: 'pos_ver', modulo: 'pos', accion: 'ver' },
      { id: 'pos_crear', modulo: 'pos', accion: 'crear' },
      { id: 'inventario_ver', modulo: 'inventario', accion: 'ver' },
      { id: 'clientes_ver', modulo: 'clientes', accion: 'ver' },
      { id: 'ropa_ver', modulo: 'ropa', accion: 'ver' },
    ],
  },

  CAJERO: {
    rol: 'CAJERO',
    permisos: [
      { id: 'caja_ver', modulo: 'caja', accion: 'ver' },
      { id: 'caja_abrir', modulo: 'caja', accion: 'crear' },
      { id: 'caja_cerrar', modulo: 'caja', accion: 'editar' },
      { id: 'pos_ver', modulo: 'pos', accion: 'ver' },
      { id: 'pos_crear', modulo: 'pos', accion: 'crear' },
    ],
  },

  ALMACENERO: {
    rol: 'ALMACENERO',
    permisos: [
      { id: 'inventario_ver', modulo: 'inventario', accion: 'ver' },
      { id: 'inventario_crear', modulo: 'inventario', accion: 'crear' },
      { id: 'inventario_editar', modulo: 'inventario', accion: 'editar' },
      { id: 'reportes_ver', modulo: 'reportes', accion: 'ver' },
    ],
  },

  CONTADOR: {
    rol: 'CONTADOR',
    permisos: [
      { id: 'reportes_ver', modulo: 'reportes', accion: 'ver' },
      { id: 'reportes_exportar', modulo: 'reportes', accion: 'exportar' },
      { id: 'dashboard_ver', modulo: 'dashboard', accion: 'ver' },
      { id: 'caja_ver', modulo: 'caja', accion: 'ver' },
    ],
  },
};

export interface UsuarioRegistrado {
  id: string;
  negocio_id: string;
  nombre: string;
  email: string;
  rol: UserRole;
  permisos: Permission[];
  activo: boolean;
  telefono?: string;
  fecha_registro: string;
  ultimo_acceso?: string;
}
