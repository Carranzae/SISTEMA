export interface CashRegister {
  id: string;
  negocio_id: string;
  estado: 'ABIERTA' | 'CERRADA';
  saldo_apertura: number;
  saldo_cierre?: number;
  fecha_apertura: string;
  fecha_cierre?: string;
  usuario_apertura: string;
  usuario_cierre?: string;
}

export interface CashMovement {
  id: string;
  caja_id: string;
  negocio_id: string;
  tipo: 'INGRESO' | 'EGRESO';
  concepto: string;
  monto: number;
  referencia?: string;
  comprobante_url?: string;
  created_at: string;
  usuario_id: string;
}

export interface CashConciliation {
  id: string;
  caja_id: string;
  saldo_sistema: number;
  saldo_fisico: number;
  diferencia: number;
  notas?: string;
  conciliado: boolean;
  fecha: string;
}
