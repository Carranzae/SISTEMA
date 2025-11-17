-- Tabla: cash_movements
CREATE TABLE IF NOT EXISTS cash_movements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    negocio_id UUID REFERENCES negocios(id) ON DELETE CASCADE NOT NULL,
    type VARCHAR(20) NOT NULL, -- 'INGRESO', 'EGRESO'
    concept VARCHAR(255) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla: cash_register
CREATE TABLE IF NOT EXISTS cash_register (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    negocio_id UUID REFERENCES negocios(id) ON DELETE CASCADE NOT NULL UNIQUE,
    status VARCHAR(20) NOT NULL DEFAULT 'CLOSED', -- 'OPEN', 'CLOSED'
    opening_balance DECIMAL(10,2) DEFAULT 0,
    closing_balance DECIMAL(10,2),
    opened_at TIMESTAMPTZ DEFAULT NOW(),
    closed_at TIMESTAMPTZ
);

-- Índices
CREATE INDEX idx_cash_movements_negocio ON cash_movements(negocio_id);
CREATE INDEX idx_cash_movements_created ON cash_movements(created_at);
CREATE INDEX idx_cash_register_negocio ON cash_register(negocio_id);
