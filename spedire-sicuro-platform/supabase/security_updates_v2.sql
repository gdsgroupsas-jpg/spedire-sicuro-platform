-- 1. Creazione tabella PROFILES per gestione Ruoli e Tenant
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin', 'manager')),
  tenant_id UUID DEFAULT gen_random_uuid(), -- Per ora ogni utente è un tenant isolato
  calls_remaining INTEGER DEFAULT 50, -- Per Rate Limiting
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Abilita RLS su profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Ognuno vede il suo profilo
CREATE POLICY "Users can view own profile" ON public.profiles
FOR SELECT USING (auth.uid() = id);

-- Policy: Admin vede tutto
CREATE POLICY "Admins can view all profiles" ON public.profiles
FOR SELECT USING (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
);

-- Trigger per creare profilo automaticamente alla registrazione
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role)
  VALUES (new.id, new.email, 'user');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger (se non esiste già)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();


-- 2. Aggiornamento SPEDIZIONI per supportare Tenant
ALTER TABLE spedizioni ADD COLUMN IF NOT EXISTS tenant_id UUID;

-- Aggiorna RLS su Spedizioni per usare Tenant/Role
DROP POLICY IF EXISTS "Users can view own shipments" ON spedizioni;
DROP POLICY IF EXISTS "Users can insert own shipments" ON spedizioni;
DROP POLICY IF EXISTS "Users can update own shipments" ON spedizioni;

-- Policy SELECT: Vede se è suo, o se è del suo tenant, o se è admin
CREATE POLICY "Tenant Isolation Policy" ON spedizioni
FOR SELECT USING (
  auth.uid() = user_id 
  OR 
  tenant_id = (SELECT tenant_id FROM public.profiles WHERE id = auth.uid())
  OR
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
);

-- Policy INSERT: Assegna automaticamente tenant_id (tramite trigger o default, qui semplificato nel check)
CREATE POLICY "Insert own shipments" ON spedizioni
FOR INSERT WITH CHECK (
  auth.uid() = user_id
);

-- 3. DATA MASKING: Secure View
-- Questa vista esclude colonne sensibili come 'confronto_prezzi' (se contiene margini) o 'prezzo_finale' se nascosto
CREATE OR REPLACE VIEW public.client_shipments_view AS
SELECT
  id,
  created_at,
  user_id,
  tenant_id,
  destinatario,
  indirizzo,
  cap,
  localita,
  provincia,
  country,
  peso,
  colli,
  contrassegno,
  telefono,
  email_destinatario,
  contenuto,
  order_id,
  rif_mittente,
  rif_destinatario,
  note,
  corriere_scelto,
  servizio_scelto,
  -- Escludiamo prezzo_finale se considerato sensibile, altrimenti lo includiamo
  prezzo_finale, 
  immagine_url,
  mittente_nome,
  mittente_citta,
  -- Escludiamo esplicitamente: dati_ocr (raw), confronto_prezzi (margini)
  status -- Assumendo ci sia una colonna status, o bozza
FROM public.spedizioni;

-- Grant access to the view
GRANT SELECT ON public.client_shipments_view TO authenticated;
