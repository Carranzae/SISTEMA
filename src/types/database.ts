export interface Negocio {
  id: string;
  user_id: string;
  nombre_comercial: string;
  ruc?: string;
  logo_url?: string;
  pais: string;
  departamento?: string;
  provincia?: string;
  distrito?: string;
  direccion_completa?: string;
  rubro: string;
  modelo_negocio: 'B2C' | 'B2B' | 'HIBRIDO';
  configuracion: Record<string, boolean>;
  modulos_activos: Record<string, boolean>;
  plan_actual: string;
  moneda: string;
  created_at: string;
  updated_at: string;
}

export interface Usuario {
  id: string;
  negocio_id: string;
  user_id: string;
  nombre: string;
  email?: string;
  rol: 'ADMINISTRADOR' | 'VENDEDOR' | 'ALMACENERO' | 'CONTADOR';
  permisos: Record<string, boolean>;
  activo: boolean;
  created_at: string;
}

export interface Producto {
  id: string;
  negocio_id: string;
  codigo?: string;
  codigo_barras?: string;
  nombre: string;
  descripcion?: string;
  categoria?: string;
  precio_compra: number;
  precio_venta: number;
  precio_mayorista?: number;
  stock_actual: number;
  stock_minimo: number;
  unidad_medida: string;
  atributos: Record<string, any>;
  fotos: string[];
  activo: boolean;
  created_at: string;
  updated_at: string;
}

export interface Cliente {
  id: string;
  negocio_id: string;
  nombre: string;
  numero_documento?: string;
  email?: string;
  telefono?: string;
  direccion?: string;
  distrito?: string;
  es_empresa: boolean;
  razon_social?: string;
  ruc_cliente?: string;
  tipo_cliente: string;
  limite_credito?: number;
  activo: boolean;
  created_at: string;
}

export interface VentaItem {
  producto_id: string;
  cantidad: number;
  precio_unitario: number;
  atributos_seleccionados?: Record<string, any>;
  subtotal: number;
}

export interface Venta {
  id: string;
  negocio_id: string;
  cliente_id?: string;
  vendedor_id?: string;
  tipo: 'CONTADO' | 'CREDITO';
  subtotal: number;
  impuesto: number;
  descuento: number;
  total: number;
  metodo_pago: string;
  estado: 'PAGADO' | 'PENDIENTE' | 'ANULADO';
  tipo_comprobante?: string;
  items: VentaItem[];
  created_at: string;
}

export interface PagoYapePlin {
  id: string;
  negocio_id: string;
  monto: number;
  fecha_hora: string;
  numero_operacion?: string;
  nombre_remitente?: string;
  plataforma: 'YAPE' | 'PLIN';
  estado: 'PENDIENTE' | 'ASOCIADO' | 'RECHAZADO';
  venta_id?: string;
  created_at: string;
}
