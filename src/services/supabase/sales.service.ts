import { supabase } from './client';
import type { Venta, VentaItem } from '@types/database';

export interface CreateSaleData {
  cliente_id?: string;
  vendedor_id?: string;
  tipo: 'CONTADO' | 'CREDITO';
  subtotal: number;
  impuesto: number;
  descuento?: number;
  total: number;
  metodo_pago: string;
  items: VentaItem[];
  tipo_comprobante?: string;
}

export const salesService = {
  // Crear venta
  async createSale(businessId: string, data: CreateSaleData) {
    const { data: result, error } = await supabase
      .from('ventas')
      .insert([
        {
          negocio_id: businessId,
          estado: 'PAGADO',
          ...data,
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return result as Venta;
  },

  // Obtener ventas del negocio
  async getSales(
    businessId: string,
    filters?: {
      startDate?: string;
      endDate?: string;
      metodo_pago?: string;
    }
  ) {
    let query = supabase
      .from('ventas')
      .select('*')
      .eq('negocio_id', businessId);

    if (filters?.startDate && filters?.endDate) {
      query = query
        .gte('created_at', filters.startDate)
        .lte('created_at', filters.endDate);
    }

    if (filters?.metodo_pago) {
      query = query.eq('metodo_pago', filters.metodo_pago);
    }

    const { data, error } = await query.order('created_at', {
      ascending: false,
    });

    if (error) throw error;
    return data as Venta[];
  },

  // Obtener venta por ID
  async getSale(saleId: string) {
    const { data, error } = await supabase
      .from('ventas')
      .select('*')
      .eq('id', saleId)
      .single();

    if (error) throw error;
    return data as Venta;
  },

  // Anular venta
  async cancelSale(saleId: string) {
    const { data, error } = await supabase
      .from('ventas')
      .update({ estado: 'ANULADO' })
      .eq('id', saleId)
      .select()
      .single();

    if (error) throw error;
    return data as Venta;
  },

  // Obtener resumen de ventas
  async getSalesSummary(businessId: string, days: number = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const { data, error } = await supabase
      .from('ventas')
      .select('total, metodo_pago, created_at')
      .eq('negocio_id', businessId)
      .eq('estado', 'PAGADO')
      .gte('created_at', startDate.toISOString());

    if (error) throw error;

    // Procesar datos
    const totalVentas = data.reduce((sum, v) => sum + v.total, 0);
    const ventasPorDia = new Map<string, number>();

    data.forEach((venta: any) => {
      const fecha = new Date(venta.created_at).toISOString().split('T')[0];
      ventasPorDia.set(fecha, (ventasPorDia.get(fecha) || 0) + venta.total);
    });

    return {
      total: totalVentas,
      cantidad: data.length,
      promedioDiario: totalVentas / days,
      ventasPorDia: Object.fromEntries(ventasPorDia),
    };
  },
};
