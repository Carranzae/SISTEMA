import { RubroConfig } from '@types/business';

export const RUBROS: Record<string, RubroConfig> = {
  abarrotes: {
    nombre: 'Abarrotes / Bodega',
    emoji: '🛒',
    caracteristicas: {
      maneja_vencimientos: true,
      usa_lector_barras: true,
      vende_credito: true,
    },
    preguntas: [
      '¿Maneja productos con fecha de vencimiento?',
      '¿Usa lector de códigos de barras?',
      '¿Vende a crédito (fío)?',
      '¿Recibe pagos con Yape/Plin?',
    ],
    modulos_recomendados: ['delivery', 'marketplace'],
  },
  ropa: {
    nombre: 'Ropa, Calzado y Accesorios',
    emoji: '👗',
    caracteristicas: {
      maneja_tallas_colores: true,
    },
    preguntas: [
      '¿Maneja tallas y colores?',
      '¿Quiere vender en marketplace online?',
      '¿Vende por temporada (colecciones)?',
    ],
    modulos_recomendados: ['marketplace', 'multi_usuario'],
  },
  papa_mayorista: {
    nombre: 'Papa / Mayorista',
    emoji: '🥔',
    caracteristicas: {
      venta_por_peso: true,
      vende_credito: true,
    },
    preguntas: [
      '¿Vende por peso (Kg/Sacos)?',
      '¿Maneja cuentas por cobrar?',
      '¿Tiene proveedores fijos?',
    ],
    modulos_recomendados: ['multi_usuario'],
  },
  electronica: {
    nombre: 'Electrónica y Tecnología',
    emoji: '📱',
    caracteristicas: {
      maneja_numeros_serie: true,
      maneja_garantias: true,
    },
    preguntas: [
      '¿Gestiona números de serie/IMEI?',
      '¿Controla garantías?',
      '¿Ofrece servicio técnico?',
    ],
    modulos_recomendados: ['marketplace', 'multi_usuario'],
  },
  verduleria: {
    nombre: 'Verdulería / Frutas',
    emoji: '🥦',
    caracteristicas: {
      venta_por_peso: true,
      control_merma: true,
    },
    preguntas: [
      '¿Vende por peso?',
      '¿Controla merma/desperdicios?',
    ],
    modulos_recomendados: [],
  },
  farmacia: {
    nombre: 'Farmacia / Botica',
    emoji: '💊',
    caracteristicas: {
      maneja_vencimientos: true,
      usa_lector_barras: true,
    },
    preguntas: [
      '¿Maneja fecha de vencimiento?',
      '¿Usa lector de códigos?',
    ],
    modulos_recomendados: ['marketplace'],
  },
  restaurante: {
    nombre: 'Restaurante / Comida',
    emoji: '🍕',
    caracteristicas: {
      vende_credito: true,
    },
    preguntas: [
      '¿Ofrece servicio a domicilio?',
    ],
    modulos_recomendados: ['delivery', 'marketplace'],
  },
  ferreteria: {
    nombre: 'Ferretería / Construcción',
    emoji: '🔧',
    caracteristicas: {
      vende_credito: true,
      usa_lector_barras: true,
    },
    preguntas: [
      '¿Vende a crédito?',
      '¿Usa códigos de barras?',
    ],
    modulos_recomendados: ['multi_usuario', 'marketplace'],
  },
  hogar: {
    nombre: 'Hogar y Decoración',
    emoji: '🏠',
    caracteristicas: {},
    preguntas: [],
    modulos_recomendados: ['marketplace'],
  },
  otro: {
    nombre: 'Otro / General',
    emoji: '🏪',
    caracteristicas: {},
    preguntas: [],
    modulos_recomendados: [],
  },
};

export const DEPARTAMENTOS_PERU = [
  'Amazonas', 'Áncash', 'Apurímac', 'Arequipa', 'Ayacucho',
  'Cajamarca', 'Callao', 'Cusco', 'Huancavelica', 'Huánuco',
  'Ica', 'Junín', 'La Libertad', 'Lambayeque', 'Lima',
  'Loreto', 'Madre de Dios', 'Moquegua', 'Pasco', 'Piura',
  'Puno', 'San Martín', 'Tacna', 'Tumbes', 'Ucayali',
];

export const UNIDADES_MEDIDA = ['UND', 'KG', 'LT', 'SACO', 'CAJA', 'BOLSA', 'DOCENA'];

export const METODOS_PAGO = ['EFECTIVO', 'YAPE', 'PLIN', 'TARJETA', 'TRANSFERENCIA'];

export const TIPOS_COMPROBANTE = ['BOLETA', 'FACTURA', 'TICKET'];

export const ROLES_USUARIO = [
  { value: 'ADMINISTRADOR', label: 'Administrador' },
  { value: 'VENDEDOR', label: 'Vendedor' },
  { value: 'ALMACENERO', label: 'Almacenero' },
  { value: 'CONTADOR', label: 'Contador' },
];

export const PLANES = {
  GRATUITO: { nombre: 'Gratuito', precio: 0 },
  BASICO: { nombre: 'Básico', precio: 49 },
  PROFESIONAL: { nombre: 'Profesional', precio: 99 },
  EMPRESARIAL: { nombre: 'Empresarial', precio: 199 },
};

export const MODULOS = {
  facturacion_electronica: { nombre: 'Facturación Electrónica', precio: 29 },
  integracion_yape: { nombre: 'Integración Yape', precio: 19 },
  integracion_plin: { nombre: 'Integración Plin', precio: 19 },
  marketplace: { nombre: 'Marketplace', precio: 39 },
  multi_usuario: { nombre: 'Multi-usuario', precio: 25 },
  delivery: { nombre: 'Control de Delivery', precio: 15 },
};
