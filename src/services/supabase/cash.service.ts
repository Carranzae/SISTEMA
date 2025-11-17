import { supabase } from './client';
import type { CashRegister, CashMovement, CashConciliation } from '@types/cash';

export const cashService = {
  // Abrir caja
  async openCash(
    businessId: string,
    userId: string,
    initialBalance: number
  ): Promise<CashRegister> {
    const { data, error } = await supabase
      .from('cash_registers')
      .insert([
        {
          negocio_id: businessId,
          estado: 'ABIERTA',
          saldo_apertura: initialBalance,
          fecha_apertura: new Date().toISOString(),
          usuario_apertura: userId,
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return data as CashRegister;
  },

  // Cerrar caja
  async closeCash(
    cashId: string,
    userId: string,
    closingBalance: number
  ): Promise<CashRegister> {
    const { data, error } = await supabase
      .from('cash_registers')
      .update({
        estado: 'CERRADA',
        saldo_cierre: closingBalance,
        fecha_cierre: new Date().toISOString(),
        usuario_cierre: userId,
      })
      .eq('id', cashId)
      .select()
      .single();

    if (error) throw error;
    return data as CashRegister;
  },

  // Obtener caja abierta
  async getOpenCash(businessId: string): Promise<CashRegister | null> {
    const { data, error } = await supabase
      .from('cash_registers')
      .select('*')
      .eq('negocio_id', businessId)
      .eq('estado', 'ABIERTA')
      .single();

    if (error && error.code === 'PGRST116') return null;
    if (error) throw error;
    return data as CashRegister;
  },

  // Registrar movimiento
  async addMovement(
    cashId: string,
    businessId: string,
    userId: string,
    movement: Omit<CashMovement, 'id' | 'caja_id' | 'negocio_id' | 'created_at' | 'usuario_id'>
  ): Promise<CashMovement> {
    const { data, error } = await supabase
      .from('cash_movements')
      .insert([
        {
          caja_id: cashId,
          negocio_id: businessId,
          usuario_id: userId,
          ...movement,
          created_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return data as CashMovement;
  },

  // Obtener movimientos del día
  async getDayMovements(cashId: string): Promise<CashMovement[]> {
    const { data, error } = await supabase
      .from('cash_movements')
      .select('*')
      .eq('caja_id', cashId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as CashMovement[];
  },

  // Conciliar caja
  async conciliateCash(
    cashId: string,
    physicalBalance: number,
    notes?: string
  ): Promise<CashConciliation> {
    // Obtener saldo del sistema
    const movements = await this.getDayMovements(cashId);
    const totalIngresos = movements
      .filter((m) => m.tipo === 'INGRESO')
      .reduce((sum, m) => sum + m.monto, 0);
    const totalEgresos = movements
      .filter((m) => m.tipo === 'EGRESO')
      .reduce((sum, m) => sum + m.monto, 0);

    const { data: cashData } = await supabase
      .from('cash_registers')
      .select('saldo_apertura')
      .eq('id', cashId)
      .single();

    const systemBalance =
      (cashData?.saldo_apertura || 0) + totalIngresos - totalEgresos;
    const difference = physicalBalance - systemBalance;

    const { data, error } = await supabase
      .from('cash_conciliations')
      .insert([
        {
          caja_id: cashId,
          saldo_sistema: systemBalance,
          saldo_fisico: physicalBalance,
          diferencia: difference,
          notas: notes,
          conciliado: difference === 0,
          fecha: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return data as CashConciliation;
  },

  // Obtener resumen de caja
  async getCashSummary(cashId: string) {
    const movements = await this.getDayMovements(cashId);
    const { data: cashData } = await supabase
      .from('cash_registers')
      .select('saldo_apertura')
      .eq('id', cashId)
      .single();

    const totalIngresos = movements
      .filter((m) => m.tipo === 'INGRESO')
      .reduce((sum, m) => sum + m.monto, 0);
    const totalEgresos = movements
      .filter((m) => m.tipo === 'EGRESO')
      .reduce((sum, m) => sum + m.monto, 0);

    return {
      saldo_apertura: cashData?.saldo_apertura || 0,
      total_ingresos: totalIngresos,
      total_egresos: totalEgresos,
      saldo_esperado:
        (cashData?.saldo_apertura || 0) + totalIngresos - totalEgresos,
      movimientos: {
        ingresos: movements.filter((m) => m.tipo === 'INGRESO'),
        egresos: movements.filter((m) => m.tipo === 'EGRESO'),
      },
    };
  },
};
