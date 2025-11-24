# 🚀 SUPABASE MIGRATION PROTOCOL (Comet Agent Guide)

**TARGET:** Allineare lo schema del Database Supabase con il codice di produzione (Next.js).
**URGENCY:** CRITICAL (Fixes OCR upload error & Security RLS).

---

## 🛠️ STEP 1: SQL EXECUTION (Main Migration)

Apri l'**SQL Editor** nella Dashboard di Supabase ed esegui il seguente blocco di codice in una volta sola.

```sql
-- =================================================================
-- 1. SECURITY CORE: PROFILES & TENANTS
-- =================================================================

-- Crea tabella profiles se non esiste
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin', 'manager')),
  tenant_id UUID DEFAULT gen_random_uuid(),
  calls_remaining INTEGER DEFAULT 50, -- Per Rate Limiting API OCR
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Abilita RLS su profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policy Profiles: Ognuno vede il suo
DROP POLICY IF EXISTS "Users view own profile" ON public.profiles;
CREATE POLICY "Users view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);

-- Policy Profiles: Admin vede tutto
DROP POLICY IF EXISTS "Admins view all profiles" ON public.profiles;
CREATE POLICY "Admins view all profiles" ON public.profiles FOR SELECT USING (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
);

-- Trigger: Crea automaticamente profilo alla registrazione
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role)
  VALUES (new.id, new.email, 'user');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();


-- =================================================================
-- 2. SHIPMENTS EVOLUTION: SENDER & SECURITY FIELDS
-- =================================================================

-- Aggiungi campi per sicurezza RLS
ALTER TABLE spedizioni ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);
ALTER TABLE spedizioni ADD COLUMN IF NOT EXISTS tenant_id UUID;

-- Aggiungi campi per gestione Mittente (Feature Sender)
ALTER TABLE spedizioni ADD COLUMN IF NOT EXISTS mittente_nome text;
ALTER TABLE spedizioni ADD COLUMN IF NOT EXISTS mittente_indirizzo text;
ALTER TABLE spedizioni ADD COLUMN IF NOT EXISTS mittente_cap text;
ALTER TABLE spedizioni ADD COLUMN IF NOT EXISTS mittente_citta text;
ALTER TABLE spedizioni ADD COLUMN IF NOT EXISTS mittente_provincia text;
ALTER TABLE spedizioni ADD COLUMN IF NOT EXISTS mittente_telefono text;
ALTER TABLE spedizioni ADD COLUMN IF NOT EXISTS mittente_email text;

-- Abilita RLS su Spedizioni
ALTER TABLE spedizioni ENABLE ROW LEVEL SECURITY;

-- Policy Spedizioni: Isolamento Tenant e Utente
DROP POLICY IF EXISTS "Tenant Isolation Policy" ON spedizioni;
CREATE POLICY "Tenant Isolation Policy" ON spedizioni
FOR SELECT USING (
  auth.uid() = user_id 
  OR 
  tenant_id = (SELECT tenant_id FROM public.profiles WHERE id = auth.uid())
  OR
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
);

DROP POLICY IF EXISTS "Insert own shipments" ON spedizioni;
CREATE POLICY "Insert own shipments" ON spedizioni
FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Update own shipments" ON spedizioni;
CREATE POLICY "Update own shipments" ON spedizioni
FOR UPDATE USING (auth.uid() = user_id OR (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');


-- =================================================================
-- 3. LOG & PRICELISTS SECURITY
-- =================================================================

ALTER TABLE listini_corrieri ENABLE ROW LEVEL SECURITY;
ALTER TABLE log_operazioni ENABLE ROW LEVEL SECURITY;

-- Listini: Tutti leggono, solo Admin scrive
DROP POLICY IF EXISTS "Authenticated users view pricelists" ON listini_corrieri;
CREATE POLICY "Authenticated users view pricelists" ON listini_corrieri FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admins manage pricelists" ON listini_corrieri;
CREATE POLICY "Admins manage pricelists" ON listini_corrieri FOR ALL USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

-- Log: Utenti vedono i propri log (se implementato user_id su log), Admin tutti
-- Nota: Assumiamo che log_operazioni non abbia ancora user_id, lo aggiungiamo per sicurezza futura
ALTER TABLE log_operazioni ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

DROP POLICY IF EXISTS "Users view own logs" ON log_operazioni;
CREATE POLICY "Users view own logs" ON log_operazioni FOR SELECT USING (auth.uid() = user_id OR (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');
CREATE POLICY "Insert logs" ON log_operazioni FOR INSERT WITH CHECK (true); -- Permetti insert a sistema


-- =================================================================
-- 4. DATA MASKING (SECURE VIEW)
-- =================================================================

-- Vista sicura per il frontend che nasconde margini e costi fornitore
CREATE OR REPLACE VIEW public.client_shipments_view AS
SELECT
  id, created_at, user_id, tenant_id, destinatario, indirizzo, cap, localita, provincia, country,
  peso, colli, contrassegno, telefono, email_destinatario, contenuto, order_id,
  rif_mittente, rif_destinatario, note, corriere_scelto, servizio_scelto,
  prezzo_finale, -- Solo il prezzo finale al cliente
  immagine_url, 
  mittente_nome, mittente_citta,
  'created' as status
FROM public.spedizioni;

-- Permessi sulla vista
GRANT SELECT ON public.client_shipments_view TO authenticated;
```

---

## ✅ STEP 2: VERIFICATION

Dopo aver eseguito lo script:

1.  Controlla che la tabella `profiles` esista.
2.  Controlla che `spedizioni` abbia la colonna `user_id`.
3.  Prova a ricaricare la pagina "OCR" della piattaforma e caricare un'immagine. Dovrebbe funzionare ora che il DB accetta il campo `user_id`.
