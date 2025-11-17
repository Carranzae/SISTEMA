import { supabase } from './client';
import type { Producto } from '@types/database';

export interface CreateProductData {
  codigo?: string;
  codigo_barras?: string;
  nombre: string;
  descripcion?: string;
  categoria?: string;
  precio_compra: number;
  precio_venta: number;
  precio_mayorista?: number;
  stock_actual?: number;
  stock_minimo?: number;
  unidad_medida: string;
  atributos?: Record<string, any>;
}

export const productsService = {
  // Crear producto
  async createProduct(businessId: string, data: CreateProductData) {
    const { data: result, error } = await supabase
      .from('productos')
      .insert([
        {
          negocio_id: businessId,
          ...data,
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return result as Producto;
  },

  // Obtener todos los productos del negocio
  async getProducts(businessId: string, filters?: { categoria?: string }) {
    let query = supabase
      .from('productos')
      .select('*')
      .eq('negocio_id', businessId)
      .eq('activo', true);

    if (filters?.categoria) {
      query = query.eq('categoria', filters.categoria);
    }

    const { data, error } = await query.order('nombre', { ascending: true });

    if (error) throw error;
    return data as Producto[];
  },

  // Obtener producto por ID
  async getProduct(productId: string) {
    const { data, error } = await supabase
      .from('productos')
      .select('*')
      .eq('id', productId)
      .single();

    if (error) throw error;
    return data as Producto;
  },

  // Buscar productos por código de barras
  async searchByBarcode(businessId: string, barcode: string) {
    const { data, error } = await supabase
      .from('productos')
      .select('*')
      .eq('negocio_id', businessId)
      .or(
        `codigo_barras.eq.${barcode},codigo.eq.${barcode}`
      )
      .single();

    if (error) throw error;
    return data as Producto;
  },

  // Actualizar producto
  async updateProduct(productId: string, updates: Partial<CreateProductData>) {
    const { data, error } = await supabase
      .from('productos')
      .update(updates)
      .eq('id', productId)
      .select()
      .single();

    if (error) throw error;
    return data as Producto;
  },

  // Actualizar stock
  async updateStock(productId: string, newStock: number) {
    return this.updateProduct(productId, { stock_actual: newStock });
  },

  // Desactivar producto
  async deleteProduct(productId: string) {
    const { error } = await supabase
      .from('productos')
      .update({ activo: false })
      .eq('id', productId);

    if (error) throw error;
  },

  // Subir fotos de producto
  async uploadProductPhotos(businessId: string, productId: string, files: any[]) {
    const photoUrls: string[] = [];

    for (const file of files) {
      const fileName = `${businessId}/${productId}/${Date.now()}-${Math.random()}.jpg`;

      const { data, error } = await supabase.storage
        .from('product-photos')
        .upload(fileName, file);

      if (error) throw error;

      const { data: publicUrl } = supabase.storage
        .from('product-photos')
        .getPublicUrl(fileName);

      photoUrls.push(publicUrl.publicUrl);
    }

    // Actualizar producto con fotos
    await this.updateProduct(productId, { fotos: photoUrls });

    return photoUrls;
  },
};
