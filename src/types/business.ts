export type Rubro = 
  | 'abarrotes'
  | 'ropa'
  | 'papa_mayorista'
  | 'electronica'
  | 'verduleria'
  | 'farmacia'
  | 'restaurante'
  | 'ferreteria'
  | 'hogar'
  | 'carniceria'
  | 'otro';

export type ModeloNegocio = 'B2C' | 'B2B' | 'HIBRIDO';

export interface RubroConfig {
  nombre: string;
  emoji: string;
  caracteristicas: {
    maneja_vencimientos?: boolean;
    usa_lector_barras?: boolean;
    vende_credito?: boolean;
    maneja_tallas_colores?: boolean;
    venta_por_peso?: boolean;
    maneja_numeros_serie?: boolean;
    maneja_garantias?: boolean;
    control_merma?: boolean;
  };
  preguntas: string[];
  modulos_recomendados: string[];
}

export interface Ubicacion {
  pais: string;
  departamento: string;
  provincia: string;
  distrito: string;
  direccion_completa: string;
}

export type Plan = 'GRATUITO' | 'BASICO' | 'PROFESIONAL' | 'EMPRESARIAL';

export interface PlanConfig {
  nombre: string;
  precio: number;
  caracteristicas: string[];
  usuarios_incluidos: number;
  sucursales_incluidas: number;
}
