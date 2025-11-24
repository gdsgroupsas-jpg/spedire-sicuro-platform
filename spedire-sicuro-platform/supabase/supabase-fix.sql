-- ========================================
-- SUPABASE FIX: RESET LISTINI TABLE
-- For Intelligence-First System Integration
-- Date: 2025-11-24
-- ========================================

-- Reset the listini (price list) table for new Intelligence-First system
-- This clears old data and prepares the table for AI-powered price calculation

-- 1. Drop existing table if needed (safe with IF EXISTS)
DROP TABLE IF EXISTS public.listini CASCADE;

-- 2. Recreate the listini table with new schema optimized for AI integration
CREATE TABLE IF NOT EXISTS public.listini (
    id BIGSERIAL PRIMARY KEY,
    codice_prodotto VARCHAR(50) NOT NULL UNIQUE,
    descrizione TEXT NOT NULL,
    prezzo_base NUMERIC(12,2) NOT NULL,
    valuta VARCHAR(3) DEFAULT 'EUR',
    categoria VARCHAR(100),
    margine_minimo NUMERIC(5,2) DEFAULT 15,
    margine_massimo NUMERIC(5,2) DEFAULT 40,
    prezzi_competitor JSONB,
    elasticita_prezzo NUMERIC(3,2),
    stagionalita JSONB,
    ai_smart_price NUMERIC(12,2),
    ai_confidence NUMERIC(3,2),
    note TEXT,
    attivo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create indexes for optimal query performance
CREATE INDEX idx_listini_codice ON public.listini(codice_prodotto);
CREATE INDEX idx_listini_categoria ON public.listini(categoria);
CREATE INDEX idx_listini_attivo ON public.listini(attivo);
CREATE INDEX idx_listini_ai_confidence ON public.listini(ai_confidence DESC);

-- 4. Enable RLS (Row Level Security) for multi-tenant support
ALTER TABLE public.listini ENABLE ROW LEVEL SECURITY;

-- 5. Create RLS policy for public access (update based on your auth requirements)
CREATE POLICY "Allow public read" ON public.listini
    FOR SELECT USING (attivo = true);

-- 6. Grant permissions
GRANT SELECT ON public.listini TO anon;
GRANT SELECT, INSERT, UPDATE ON public.listini TO authenticated;

-- 7. Verification message
SELECT 'Listini table reset successfully for Intelligence-First system' AS status;
