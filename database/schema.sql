-- Tabla: negocios (Multi-tenant)
CREATE TABLE negocios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    
    -- Información básica
    nombre_comercial VARCHAR(255) NOT NULL,
    ruc VARCHAR(11) UNIQUE,
    logo_url TEXT,
    
    -- Ubicación (Perú específicamente)
    pais VARCHAR(2) DEFAULT 'PE' NOT NULL,
    departamento VARCHAR(100),
    provincia VARCHAR(100),
    distrito VARCHAR(100),
    direccion_completa TEXT,
    
    -- Perfil del negocio
    rubro VARCHAR(50) NOT NULL, -- 'abarrotes', 'ropa', 'papa_mayorista', 'electronica', 'verduleria', 'farmacia', 'restaurante', 'ferreteria', 'otro'
    modelo_negocio VARCHAR(20) NOT NULL, -- 'B2C', 'B2B', 'HIBRIDO'
    
    -- Configuración inteligente (basada en rubro)
    configuracion JSONB DEFAULT '{
        "maneja_vencimientos": false,
        "usa_lector_barras": false,
        "vende_credito": false,
        "maneja_tallas_colores": false,
        "venta_por_peso": false,
        "maneja_numeros_serie": false,
        "maneja_garantias": false,
        "control_merma": false
    }'::jsonb,
    
    -- Módulos activos (monetización)
    modulos_activos JSONB DEFAULT '{
        "facturacion_electronica": false,
        "integracion_yape": false,
        "integracion_plin": false,
        "marketplace": false,
        "multi_usuario": false,
        "delivery": false,
        "servicio_tecnico": false
    }'::jsonb,
    
    -- Plan de suscripción
    plan_actual VARCHAR(50) DEFAULT 'GRATUITO', -- 'GRATUITO', 'BASICO', 'PROFESIONAL', 'EMPRESARIAL'
    fecha_proximo_pago DATE,
    
    -- Moneda
    moneda VARCHAR(3) DEFAULT 'PEN',
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla: usuarios (Multi-usuario por negocio)
CREATE TABLE usuarios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    negocio_id UUID REFERENCES negocios(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    
    -- Información
    nombre VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    
    -- Rol y permisos
    rol VARCHAR(50) NOT NULL, -- 'ADMINISTRADOR', 'VENDEDOR', 'ALMACENERO', 'CONTADOR'
    permisos JSONB DEFAULT '{
        "ver_dashboard": true,
        "hacer_ventas": false,
        "gestionar_inventario": false,
        "ver_reportes": false,
        "gestionar_usuarios": false,
        "gestionar_configuracion": false
    }'::jsonb,
    
    -- Control
    activo BOOLEAN DEFAULT TRUE,
    fecha_acceso_ultimo TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla: productos
CREATE TABLE productos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    negocio_id UUID REFERENCES negocios(id) ON DELETE CASCADE NOT NULL,
    
    -- Identificadores
    codigo VARCHAR(100), -- SKU o código de barras
    codigo_barras VARCHAR(100),
    nombre VARCHAR(255) NOT NULL,
    descripcion TEXT,
    categoria VARCHAR(100),
    
    -- Precios
    precio_compra DECIMAL(10,2) NOT NULL,
    precio_venta DECIMAL(10,2) NOT NULL,
    precio_mayorista DECIMAL(10,2),
    
    -- Stock
    stock_actual INTEGER DEFAULT 0,
    stock_minimo INTEGER DEFAULT 0,
    unidad_medida VARCHAR(20) NOT NULL DEFAULT 'UND', -- 'UND', 'KG', 'LT', 'SACO', 'CAJA'
    
    -- Atributos dinámicos (JSONB para flexibilidad)
    atributos JSONB DEFAULT '{}'::jsonb,
    -- Ropa: {"talla": ["XS", "S", "M", "L"], "color": ["Negro", "Blanco"]}
    -- Abarrotes: {"fecha_vencimiento": "2025-12-31", "lote": "L001"}
    -- Papa: {"calidad": "Primera", "saco_kg": 50}
    -- Electrónica: {"numero_serie": "ABC123", "imei": "123456"}
    
    -- Fotos
    fotos JSONB DEFAULT '[]'::jsonb, -- Array de URLs de storage
    
    -- Control
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla: clientes
CREATE TABLE clientes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    negocio_id UUID REFERENCES negocios(id) ON DELETE CASCADE NOT NULL,
    
    -- Datos personales
    nombre VARCHAR(255) NOT NULL,
    numero_documento VARCHAR(20),
    email VARCHAR(255),
    telefono VARCHAR(20),
    
    -- Dirección
    direccion TEXT,
    distrito VARCHAR(100),
    
    -- B2B
    es_empresa BOOLEAN DEFAULT FALSE,
    razon_social VARCHAR(255),
    ruc_cliente VARCHAR(11),
    
    -- Relación comercial
    tipo_cliente VARCHAR(50), -- 'CONSUMIDOR_FINAL', 'MAYORISTA', 'DISTRIBUIDOR'
    limite_credito DECIMAL(10,2),
    
    -- Control
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla: ventas
CREATE TABLE ventas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    negocio_id UUID REFERENCES negocios(id) ON DELETE CASCADE NOT NULL,
    
    -- Cliente y vendedor
    cliente_id UUID REFERENCES clientes(id),
    vendedor_id UUID REFERENCES usuarios(id),
    
    -- Tipo de venta
    tipo VARCHAR(20) NOT NULL, -- 'CONTADO', 'CREDITO'
    
    -- Montos
    subtotal DECIMAL(10,2) NOT NULL,
    impuesto DECIMAL(10,2) DEFAULT 0,
    descuento DECIMAL(10,2) DEFAULT 0,
    total DECIMAL(10,2) NOT NULL,
    
    -- Pago
    metodo_pago VARCHAR(50) NOT NULL, -- 'EFECTIVO', 'YAPE', 'PLIN', 'TARJETA', 'TRANSFERENCIA'
    estado VARCHAR(20) NOT NULL DEFAULT 'PAGADO', -- 'PAGADO', 'PENDIENTE', 'ANULADO'
    numero_operacion_pago VARCHAR(50),
    
    -- Comprobante
    tipo_comprobante VARCHAR(20), -- 'BOLETA', 'FACTURA', 'TICKET'
    serie_comprobante VARCHAR(10),
    numero_comprobante INTEGER,
    comprobante_electronico_id VARCHAR(50),
    
    -- Items
    items JSONB NOT NULL, -- Array de {producto_id, cantidad, precio_unitario, atributos_seleccionados, subtotal}
    
    -- Observaciones
    notas TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla: pagos_yape_plin (Integración Yape/Plin)
CREATE TABLE pagos_yape_plin (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    negocio_id UUID REFERENCES negocios(id) ON DELETE CASCADE NOT NULL,
    
    -- Datos del pago
    monto DECIMAL(10,2) NOT NULL,
    fecha_hora TIMESTAMPTZ NOT NULL,
    numero_operacion VARCHAR(50),
    nombre_remitente VARCHAR(255),
    
    -- Conciliación
    asociado_a_venta BOOLEAN DEFAULT FALSE,
    venta_id UUID REFERENCES ventas(id),
    
    -- Metadata
    plataforma VARCHAR(20) NOT NULL, -- 'YAPE', 'PLIN'
    estado VARCHAR(20) DEFAULT 'PENDIENTE', -- 'PENDIENTE', 'ASOCIADO', 'RECHAZADO'
    notificacion_raw JSONB,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla: cuentas_por_cobrar
CREATE TABLE cuentas_por_cobrar (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    negocio_id UUID REFERENCES negocios(id) ON DELETE CASCADE NOT NULL,
    cliente_id UUID REFERENCES clientes(id) NOT NULL,
    venta_id UUID REFERENCES ventas(id),
    
    -- Monto
    monto_total DECIMAL(10,2) NOT NULL,
    monto_pagado DECIMAL(10,2) DEFAULT 0,
    monto_pendiente DECIMAL(10,2) GENERATED ALWAYS AS (monto_total - monto_pagado) STORED,
    
    -- Fechas
    fecha_vencimiento DATE NOT NULL,
    estado VARCHAR(20) NOT NULL, -- 'PENDIENTE', 'PAGADO', 'VENCIDO', 'PARCIALMENTE_PAGADO'
    
    -- Intereses
    interes_diario DECIMAL(5,2) DEFAULT 0,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla: sucursales (Para plan Profesional+)
CREATE TABLE sucursales (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    negocio_id UUID REFERENCES negocios(id) ON DELETE CASCADE NOT NULL,
    
    nombre VARCHAR(255) NOT NULL,
    codigo VARCHAR(50),
    
    -- Ubicación
    direccion TEXT,
    departamento VARCHAR(100),
    distrito VARCHAR(100),
    
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ÍNDICES para optimización
CREATE INDEX idx_negocios_user_id ON negocios(user_id);
CREATE INDEX idx_usuarios_negocio_id ON usuarios(negocio_id);
CREATE INDEX idx_productos_negocio_id ON productos(negocio_id);
CREATE INDEX idx_ventas_negocio_id ON ventas(negocio_id);
CREATE INDEX idx_ventas_fecha ON ventas(created_at);
CREATE INDEX idx_pagos_yape_negocio_id ON pagos_yape_plin(negocio_id);
CREATE INDEX idx_cxc_negocio_id ON cuentas_por_cobrar(negocio_id);

-- RLS (Row Level Security) para multi-tenancy
ALTER TABLE negocios ENABLE ROW LEVEL SECURITY;
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE productos ENABLE ROW LEVEL SECURITY;
ALTER TABLE ventas ENABLE ROW LEVEL SECURITY;
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE pagos_yape_plin ENABLE ROW LEVEL SECURITY;
ALTER TABLE cuentas_por_cobrar ENABLE ROW LEVEL SECURITY;

-- Políticas RLS (ej: usuarios solo ven su negocio)
CREATE POLICY "negocios_select" ON negocios FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "productos_select" ON productos FOR SELECT
    USING (negocio_id IN (SELECT id FROM negocios WHERE user_id = auth.uid()));
