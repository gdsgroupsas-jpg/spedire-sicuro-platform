-- 1. Aggiunta colonna user_id a spedizioni se manca
ALTER TABLE spedizioni 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

-- Popola user_id per record esistenti (opzionale: assegna al primo utente admin o lascia null)
-- UPDATE spedizioni SET user_id = 'uuid-admin' WHERE user_id IS NULL;

-- 2. Abilita RLS su tutte le tabelle
ALTER TABLE spedizioni ENABLE ROW LEVEL SECURITY;
ALTER TABLE listini_corrieri ENABLE ROW LEVEL SECURITY;
ALTER TABLE log_operazioni ENABLE ROW LEVEL SECURITY;

-- 3. Crea funzione helper per admin (basata su email per semplicità iniziale, o metadati)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  -- Sostituisci con la logica reale, es. check su tabella profiles o email specifica
  RETURN (auth.jwt() ->> 'email') IN ('admin@spediresicuro.com', 'info@gdsgroup.it'); 
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Policies per SPEDIZIONI
-- Utenti vedono solo le loro spedizioni, Admin vede tutto
CREATE POLICY "Users can view own shipments" ON spedizioni
FOR SELECT USING (
  auth.uid() = user_id OR public.is_admin()
);

-- Utenti possono inserire solo a proprio nome
CREATE POLICY "Users can insert own shipments" ON spedizioni
FOR INSERT WITH CHECK (
  auth.uid() = user_id
);

-- Utenti modificano solo le loro (Admin tutto)
CREATE POLICY "Users can update own shipments" ON spedizioni
FOR UPDATE USING (
  auth.uid() = user_id OR public.is_admin()
);

-- 5. Policies per LISTINI CORRIERI
-- Tutti gli autenticati possono LEGGERE i listini attivi
CREATE POLICY "Authenticated users can view active pricelists" ON listini_corrieri
FOR SELECT USING (
  auth.role() = 'authenticated' AND attivo = true
);

-- Solo Admin può modificare/inserire
CREATE POLICY "Admins can manage pricelists" ON listini_corrieri
FOR ALL USING (
  public.is_admin()
);

-- 6. Policies per LOG OPERAZIONI
-- (Opzionale, se vogliamo che gli utenti vedano i propri log)
-- Assumiamo che log_operazioni debba avere user_id anche lui per essere filtrato
ALTER TABLE log_operazioni ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

CREATE POLICY "Users view own logs" ON log_operazioni
FOR SELECT USING (
  auth.uid() = user_id OR public.is_admin()
);
