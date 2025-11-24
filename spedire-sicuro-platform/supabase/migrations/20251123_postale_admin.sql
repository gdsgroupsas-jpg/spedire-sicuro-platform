-- Tabella 4: Fondo Cassa per PostaBase Mini (Internal Treasury)
CREATE TABLE IF NOT EXISTS public.fondo_cassa_postale (
    id SERIAL PRIMARY KEY,
    nome TEXT NOT NULL DEFAULT 'PostaBase Mini Saldo',
    saldo_attuale NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    ultima_ricarica TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT check_saldo_non_negativo CHECK (saldo_attuale >= 0)
);

COMMENT ON TABLE public.fondo_cassa_postale IS 'Traccia il saldo ricaricabile della PostaBase Mini.';

-- Inizializzazione (Da eseguire una sola volta)
-- INSERT INTO public.fondo_cassa_postale (saldo_attuale) VALUES (0.00) ON CONFLICT DO NOTHING;
-- Poiché id è serial, l'insert secco potrebbe duplicare se eseguito più volte senza check. 
-- Meglio un controllo di esistenza o pulire prima se in dev.
INSERT INTO public.fondo_cassa_postale (saldo_attuale)
SELECT 0.00
WHERE NOT EXISTS (SELECT 1 FROM public.fondo_cassa_postale);


-- Aggiornamento: public.spedizioni_postali (Log Operazioni & P&L)
-- Se la tabella esiste già, aggiungiamo le colonne.
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'spedizioni_postali' AND column_name = 'is_agency_operation') THEN
        ALTER TABLE public.spedizioni_postali ADD COLUMN is_agency_operation BOOLEAN NOT NULL DEFAULT TRUE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'spedizioni_postali' AND column_name = 'costo_effettivo_spedire_sicuro') THEN
        ALTER TABLE public.spedizioni_postali ADD COLUMN costo_effettivo_spedire_sicuro NUMERIC(10, 2);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'spedizioni_postali' AND column_name = 'margine_lordo') THEN
        ALTER TABLE public.spedizioni_postali ADD COLUMN margine_lordo NUMERIC(10, 2);
    END IF;

     IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'spedizioni_postali' AND column_name = 'codice_affrancatrice') THEN
        ALTER TABLE public.spedizioni_postali ADD COLUMN codice_affrancatrice TEXT;
    END IF;
END $$;


-- RLS per Fondo Cassa: SOLO gli ADMIN possono aggiornare/leggere
ALTER TABLE public.fondo_cassa_postale ENABLE ROW LEVEL SECURITY;

-- Policy permissive per ora (da restringere a veri admin in prod)
CREATE POLICY "Admin Access Fondo Cassa" ON public.fondo_cassa_postale
FOR ALL USING (
  -- auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin') -- Ideale
  auth.role() = 'authenticated' -- Temporaneo per test
);

-- Aggiornamento policy spedizioni postali
CREATE POLICY "Admin Access Spedizioni Postali" ON public.spedizioni_postali
FOR ALL USING (
   auth.role() = 'authenticated'
);
