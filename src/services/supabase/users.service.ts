import { supabase } from './client';
import type { Usuario } from '@types/database';

export interface CreateUserData {
  nombre: string;
  email?: string;
  rol: 'ADMINISTRADOR' | 'VENDEDOR' | 'ALMACENERO' | 'CONTADOR';
}

export const usersService = {
  // Crear usuario
  async createUser(businessId: string, data: CreateUserData, userId: string) {
    const { data: result, error } = await supabase
      .from('usuarios')
      .insert([
        {
          negocio_id: businessId,
          user_id: userId,
          ...data,
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return result as Usuario;
  },

  // Obtener usuarios del negocio
  async getUsers(businessId: string) {
    const { data, error } = await supabase
      .from('usuarios')
      .select('*')
      .eq('negocio_id', businessId)
      .eq('activo', true);

    if (error) throw error;
    return data as Usuario[];
  },

  // Obtener usuario por ID
  async getUser(userId: string) {
    const { data, error } = await supabase
      .from('usuarios')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw error;
    return data as Usuario;
  },

  // Actualizar usuario
  async updateUser(userId: string, updates: Partial<CreateUserData>) {
    const { data, error } = await supabase
      .from('usuarios')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return data as Usuario;
  },

  // Actualizar permisos
  async updatePermissions(
    userId: string,
    permisos: Record<string, boolean>
  ) {
    const { data, error } = await supabase
      .from('usuarios')
      .update({ permisos })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return data as Usuario;
  },

  // Desactivar usuario
  async deactivateUser(userId: string) {
    const { data, error } = await supabase
      .from('usuarios')
      .update({ activo: false })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return data as Usuario;
  },
};
