export interface ClothingProduct {
  id: string;
  negocio_id: string;
  nombre: string;
  descripcion: string;
  categoria: 'ROPA' | 'CALZADO' | 'ACCESORIO';
  tipo: string; // 'Camiseta', 'Pantalón', 'Zapato', etc.
  
  // Atributos de ropa
  tallas: string[]; // ['XS', 'S', 'M', 'L', 'XL', 'XXL']
  colores: {
    nombre: string;
    codigo_hex: string;
    fotos: string[];
  }[];
  
  // Precios
  precio_venta: number;
  precio_mayorista?: number;
  
  // Imágenes 3D y AR
  imagen_3d_url?: string; // Modelo 3D para probador
  imagen_plana: string;
  
  // Stock
  stock_por_talla_color: Record<string, Record<string, number>>;
  
  // Características específicas
  material?: string;
  composicion?: string;
  cuidados?: string;
  temporada?: 'PRIMAVERA' | 'VERANO' | 'OTOÑO' | 'INVIERNO';
  coleccion?: string;
  
  activo: boolean;
  created_at: string;
}

export interface VirtualTryOn {
  product_id: string;
  talla_seleccionada: string;
  color_seleccionado: string;
  imagen_capturada?: string;
  timestamp: string;
}
