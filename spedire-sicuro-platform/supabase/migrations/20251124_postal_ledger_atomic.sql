-- ========================================
-- ATOMIC POSTAL LEDGER MIGRATION
-- Date: 2025-11-24
-- Version: 1.0
-- Description: Implements atomic ledger system for postal services
--              with balance control, cost matrix, and P&L tracking
-- ========================================

-- TABLE 1: Postal Rate Matrix (COGS)
CREATE TABLE IF NOT EXISTS tariffe_postali (
    id SERIAL PRIMARY KEY,
    grammi INT NOT NULL UNIQUE,
    costo NUMERIC(10,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- TABLE 2: Postal Cash Fund (BLINDATO - Protected)
CREATE TABLE IF NOT EXISTS fondo_cassa_postale (
    id INT PRIMARY KEY CHECK (id = 1),
    saldo NUMERIC(14,2) NOT NULL CHECK (saldo >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- TABLE 3: Postal Shipments (Immutable Registry)
CREATE TABLE IF NOT EXISTS spedizioni_postali (
    id BIGSERIAL PRIMARY KEY,
    data TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ricavo NUMERIC(12,2) NOT NULL,
    cogs NUMERIC(12,2) NOT NULL,
    margine_lordo NUMERIC(12,2) GENERATED ALWAYS AS (ricavo - cogs) STORED,
    descrizione TEXT
);

-- FUNCTION 1: Calculate Postal P&L
CREATE OR REPLACE FUNCTION calculate_postal_pnl()
RETURNS TABLE(
    saldo NUMERIC(14,2),
    margine_30gg NUMERIC(12,2),
    margine_totale NUMERIC(12,2)
) AS $$
DECLARE
    v_saldo NUMERIC(14,2);
    v_margine_30 NUMERIC(12,2);
    v_margine_tot NUMERIC(12,2);
BEGIN
    SELECT fondo_cassa_postale.saldo INTO v_saldo FROM fondo_cassa_postale WHERE id = 1;
    SELECT COALESCE(SUM(margine_lordo), 0) INTO v_margine_30 FROM spedizioni_postali WHERE data > NOW() - INTERVAL '30 days';
    SELECT COALESCE(SUM(margine_lordo), 0) INTO v_margine_tot FROM spedizioni_postali;
    
    RETURN QUERY
    SELECT v_saldo, v_margine_30, v_margine_tot;
END;
$$ LANGUAGE plpgsql;

-- INDEX 1: Postal rates lookup
CREATE INDEX IF NOT EXISTS idx_tariffe_grammi ON tariffe_postali(grammi);

-- INDEX 2: Shipments time query
CREATE INDEX IF NOT EXISTS idx_spedizioni_data ON spedizioni_postali(data);

-- INIT: Create default postal cash fund
INSERT INTO fondo_cassa_postale (id, saldo) VALUES (1, 0)
ON CONFLICT (id) DO NOTHING;
