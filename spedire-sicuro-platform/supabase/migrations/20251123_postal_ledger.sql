-- 1. Tabella: Matrice Tariffe Postali (COGS Variabile)
-- Contiene il costo effettivo che l'agenzia paga per affrancare.
CREATE TABLE IF NOT EXISTS public.tariffe_postali (
    id BIGSERIAL PRIMARY KEY,
    servizio TEXT NOT NULL,          -- Es. 'Raccomandata', 'Posta1'
    destinazione TEXT NOT NULL,      -- Es. 'Italia', 'Europa'
    peso_min_gr INTEGER NOT NULL,    -- Limite inferiore del peso (incluso)
    peso_max_gr INTEGER NOT NULL,    -- Limite superiore del peso (escluso)
    costo_base NUMERIC(10, 2) NOT NULL, -- COSTO EFFETTIVO (COGS)
    data_valida_da DATE NOT NULL DEFAULT CURRENT_DATE,
    CONSTRAINT unique_tariffa_banda_peso UNIQUE (servizio, destinazione, peso_min_gr, peso_max_gr),
    CONSTRAINT check_peso_range CHECK (peso_min_gr >= 0 AND peso_max_gr > peso_min_gr),
    CONSTRAINT check_costo_non_negativo CHECK (costo_base >= 0)
);

-- 2. Tabella: Fondo Cassa Postale (Asset Critico a Scalare)
-- PRIORITÀ: Il saldo del credito sull'affrancatrice fisica.
CREATE TABLE IF NOT EXISTS public.fondo_cassa_postale (
    id SERIAL PRIMARY KEY,
    nome TEXT NOT NULL DEFAULT 'PostaBase Mini Saldo',
    saldo_attuale NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    ultima_ricarica TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT check_saldo_non_negativo CHECK (saldo_attuale >= 0)
);
-- Inizializzazione: Assicura l'esistenza del record Saldo (ID=1)
INSERT INTO public.fondo_cassa_postale (id, saldo_attuale) VALUES (1, 0.00) ON CONFLICT (id) DO NOTHING;

-- 3. Tabella: Registro Spedizioni Postali (Log & P&L)
-- Traccia il profitto (Margine Lordo) per ogni operazione.
CREATE TABLE IF NOT EXISTS public.spedizioni_postali (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- Admin che ha creato l'operazione
    data_creazione TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    servizio_selezionato TEXT NOT NULL,
    destinazione TEXT,
    peso_gr INTEGER NOT NULL,
    costo_utente_finale NUMERIC(10, 2) NOT NULL,    -- Ricavo (AOV)
    costo_effettivo_spedire_sicuro NUMERIC(10, 2) NOT NULL, -- COGS (Costo Scalato)
    margine_lordo NUMERIC(10, 2) NOT NULL,                   -- PROFITTO REALE
    codice_affrancatrice TEXT NOT NULL UNIQUE, 
    dati_destinatario JSONB, 
    is_agency_operation BOOLEAN NOT NULL DEFAULT TRUE, -- Flag per separare dal resto delle spedizioni
    CONSTRAINT check_peso_valido CHECK (peso_gr > 0)
);

-- PostgreSQL RPC: Calcola P&L Postale (Ultimi 30 giorni + Saldo Cassa)
CREATE OR REPLACE FUNCTION calculate_postal_pnl()
RETURNS TABLE (
    volume_spedizioni BIGINT,
    ricavo_totale NUMERIC,
    cogs_variabile_totale NUMERIC,
    margine_lordo_totale NUMERIC,
    saldo_attuale_cassa NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        COUNT(sp.id)::BIGINT AS volume_spedizioni,
        COALESCE(SUM(sp.costo_utente_finale), 0)::NUMERIC AS ricavo_totale,
        COALESCE(SUM(sp.costo_effettivo_spedire_sicuro), 0)::NUMERIC AS cogs_variabile_totale,
        COALESCE(SUM(sp.margine_lordo), 0)::NUMERIC AS margine_lordo_totale,
        (SELECT fcp.saldo_attuale FROM public.fondo_cassa_postale fcp LIMIT 1) AS saldo_attuale_cassa
    FROM
        public.spedizioni_postali sp
    WHERE
        sp.data_creazione >= NOW() - INTERVAL '30 days'
        AND sp.is_agency_operation = TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RLS Security
ALTER TABLE public.tariffe_postali ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fondo_cassa_postale ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.spedizioni_postali ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin Access Tariffe" ON public.tariffe_postali
FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Admin Access Fondo Cassa" ON public.fondo_cassa_postale
FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Admin Access Spedizioni Postali" ON public.spedizioni_postali
FOR ALL USING (auth.role() = 'authenticated');
