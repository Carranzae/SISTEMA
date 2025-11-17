import { supabase } from '../supabase/client';
import type { PagoYapePlin } from '@types/database';

export const yapeService = {
  // Registrar pago Yape/Plin
  async registerPayment(
    businessId: string,
    payment: {
      monto: number;
      numero_operacion?: string;
      nombre_remitente?: string;
      plataforma: 'YAPE' | 'PLIN';
    }
  ) {
    const { data, error } = await supabase
      .from('pagos_yape_plin')
      .insert([
        {
          negocio_id: businessId,
          ...payment,
          fecha_hora: new Date().toISOString(),
          estado: 'PENDIENTE',
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return data as PagoYapePlin;
  },

  // Obtener pagos pendientes
  async getPendingPayments(businessId: string) {
    const { data, error } = await supabase
      .from('pagos_yape_plin')
      .select('*')
      .eq('negocio_id', businessId)
      .eq('estado', 'PENDIENTE')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as PagoYapePlin[];
  },

  // Asociar pago con venta
  async associateWithSale(paymentId: string, saleId: string) {
    const { data, error } = await supabase
      .from('pagos_yape_plin')
      .update({
        venta_id: saleId,
        estado: 'ASOCIADO',
        asociado_a_venta: true,
      })
      .eq('id', paymentId)
      .select()
      .single();

    if (error) throw error;
    return data as PagoYapePlin;
  },

  // Obtener historial de pagos
  async getPaymentHistory(businessId: string, days: number = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const { data, error } = await supabase
      .from('pagos_yape_plin')
      .select('*')
      .eq('negocio_id', businessId)
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as PagoYapePlin[];
  },

  // Rechazar pago
  async rejectPayment(paymentId: string) {
    const { data, error } = await supabase
      .from('pagos_yape_plin')
      .update({ estado: 'RECHAZADO' })
      .eq('id', paymentId)
      .select()
      .single();

    if (error) throw error;
    return data as PagoYapePlin;
  },
};
