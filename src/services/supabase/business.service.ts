import { supabase } from './client';
import type { Negocio } from '@types/database';

export interface CreateBusinessData {
  nombre_comercial: string;
  ruc?: string;
  rubro: string;
  modelo_negocio: 'B2C' | 'B2B' | 'HIBRIDO';
  departamento?: string;
  provincia?: string;
  distrito?: string;
  direccion_completa?: string;
}

export const businessService = {
  // Crear nuevo negocio
  async createBusiness(data: CreateBusinessData, userId: string) {
    const { data: result, error } = await supabase
      .from('negocios')
      .insert([
        {
          user_id: userId,
          ...data,
          moneda: 'PEN',
          plan_actual: 'GRATUITO',
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return result as Negocio;
  },

  // Obtener negocio del usuario
  async getUserBusiness(userId: string) {
    const { data, error } = await supabase
      .from('negocios')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) throw error;
    return data as Negocio;
  },

  // Actualizar negocio
  async updateBusiness(businessId: string, updates: Partial<Negocio>) {
    const { data, error } = await supabase
      .from('negocios')
      .update(updates)
      .eq('id', businessId)
      .select()
      .single();

    if (error) throw error;
    return data as Negocio;
  },

  // Actualizar configuración inteligente
  async updateConfiguration(
    businessId: string,
    config: Record<string, boolean>
  ) {
    const { data, error } = await supabase
      .from('negocios')
      .update({
        configuracion: config,
      })
      .eq('id', businessId)
      .select()
      .single();

    if (error) throw error;
    return data as Negocio;
  },

  // Activar/desactivar módulos
  async updateModules(
    businessId: string,
    modules: Record<string, boolean>
  ) {
    const { data, error } = await supabase
      .from('negocios')
      .update({
        modulos_activos: modules,
      })
      .eq('id', businessId)
      .select()
      .single();

    if (error) throw error;
    return data as Negocio;
  },

  // Actualizar logo
  async uploadLogo(businessId: string, file: any) {
    const fileName = `${businessId}-${Date.now()}.jpg`;

    const { data, error } = await supabase.storage
      .from('logos')
      .upload(fileName, file);

    if (error) throw error;

    const { data: publicUrl } = supabase.storage
      .from('logos')
      .getPublicUrl(fileName);

    // Guardar URL en BD
    await this.updateBusiness(businessId, {
      logo_url: publicUrl.publicUrl,
    });

    return publicUrl.publicUrl;
  },
};
