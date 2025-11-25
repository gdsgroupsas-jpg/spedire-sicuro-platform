# 🚀 MASTER DEPLOY GUIDE: SUPABASE & VERCEL SETUP

**VERSION:** 3.0 (Inclusive of IRON DOME Security & AEO/SEO)
**TARGET:** Allineamento completo tra Codice, Database e Infrastruttura.

---

## 🛠️ 1. SUPABASE CONFIGURATION (CRITICAL)

Per far funzionare Login, OCR e Upload Listini, il database deve avere la struttura corretta.

### A. Esegui lo Script SQL (Migration)
Vai su **Supabase Dashboard** -> **SQL Editor** -> **New Query**.
Incolla ed esegui TUTTO questo blocco in una volta sola:

```sql
-- =================================================================
-- 1. CORE TABLES & PROFILES (Identity & Tenants)
-- =================================================================

-- Tabella Profili Estesa
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin', 'manager')),
  tenant_id UUID DEFAULT gen_random_uuid(),
  calls_remaining INTEGER DEFAULT 50, -- Rate Limiting OCR
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger per creare profilo al signup
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
-- 2. SHIPMENTS TABLE EVOLUTION (Features & Security)
-- =================================================================

-- Aggiungi colonne proprietario se mancano
ALTER TABLE spedizioni ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);
ALTER TABLE spedizioni ADD COLUMN IF NOT EXISTS tenant_id UUID;

-- Aggiungi campi Mittente (Feature Sender)
ALTER TABLE spedizioni ADD COLUMN IF NOT EXISTS mittente_nome text;
ALTER TABLE spedizioni ADD COLUMN IF NOT EXISTS mittente_indirizzo text;
ALTER TABLE spedizioni ADD COLUMN IF NOT EXISTS mittente_cap text;
ALTER TABLE spedizioni ADD COLUMN IF NOT EXISTS mittente_citta text;
ALTER TABLE spedizioni ADD COLUMN IF NOT EXISTS mittente_provincia text;
ALTER TABLE spedizioni ADD COLUMN IF NOT EXISTS mittente_telefono text;
ALTER TABLE spedizioni ADD COLUMN IF NOT EXISTS mittente_email text;

-- =================================================================
-- 3. ROW LEVEL SECURITY (RLS) - "IRON DOME"
-- =================================================================

-- Abilita RLS ovunque
ALTER TABLE spedizioni ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE listini_corrieri ENABLE ROW LEVEL SECURITY;
ALTER TABLE log_operazioni ENABLE ROW LEVEL SECURITY;

-- Policy Profiles
DROP POLICY IF EXISTS "Users view own profile" ON public.profiles;
CREATE POLICY "Users view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);

-- Policy Spedizioni (Isolamento Totale)
DROP POLICY IF EXISTS "Tenant Isolation Policy" ON spedizioni;
CREATE POLICY "Tenant Isolation Policy" ON spedizioni
FOR SELECT USING (
  auth.uid() = user_id OR 
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
);

DROP POLICY IF EXISTS "Insert own shipments" ON spedizioni;
CREATE POLICY "Insert own shipments" ON spedizioni
FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Update own shipments" ON spedizioni;
CREATE POLICY "Update own shipments" ON spedizioni
FOR UPDATE USING (auth.uid() = user_id OR (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

-- Policy Listini (Admin Only Write, User Read)
DROP POLICY IF EXISTS "Authenticated users view pricelists" ON listini_corrieri;
CREATE POLICY "Authenticated users view pricelists" ON listini_corrieri FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admins manage pricelists" ON listini_corrieri;
CREATE POLICY "Admins manage pricelists" ON listini_corrieri FOR ALL USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

-- =================================================================
-- 4. SECURE VIEW (Data Masking)
-- =================================================================

-- Vista per il frontend (nasconde margini reali)
CREATE OR REPLACE VIEW public.client_shipments_view AS
SELECT
  id, created_at, user_id, tenant_id, destinatario, indirizzo, cap, localita, provincia, country,
  peso, colli, contrassegno, telefono, email_destinatario, contenuto, order_id,
  rif_mittente, rif_destinatario, note, corriere_scelto, servizio_scelto,
  prezzo_finale, -- Escluso costo_fornitore e margine
  immagine_url, 
  mittente_nome, mittente_citta,
  'created' as status
FROM public.spedizioni;

GRANT SELECT ON public.client_shipments_view TO authenticated;
```

---

## ⚡ 2. VERCEL CONFIGURATION (Environment Variables)

Vai su **Vercel** -> **Settings** -> **Environment Variables**. Assicurati che queste chiavi siano presenti e corrette (soprattutto la Service Role Key aggiunta di recente).

| Variable Name | Value Source | Note |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Settings -> API | URL del progetto |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase Settings -> API | Chiave `anon` `public` |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Settings -> API | **NUOVA** Chiave `service_role` (secret) |
| `GOOGLE_API_KEY` | Google AI Studio | Chiave Vision per Gemini OCR |

**⚠️ IMPORTANTE:** Se aggiorni le variabili, devi fare **Redeploy** (o riavviare il server locale).

---

## ✅ 3. FINAL HEALTH CHECK (Smoke Test)

Dopo aver fatto `git push origin main` e atteso il deploy, verifica questi punti:

1.  **Login:** Riesci ad accedere? (Se no -> Check `NEXT_PUBLIC_SUPABASE_ANON_KEY` su Vercel).
2.  **Crea Spedizione:**
    *   Vai su `/dashboard/crea-spedizione`.
    *   Vedi il tasto "Crea Spedizione" in basso? (Se no -> Sticky Footer issue).
    *   Salva una spedizione di prova. Funziona? (Se no -> Check SQL Migration `user_id`).
3.  **OCR:**
    *   Carica un'immagine.
    *   Se dà errore "Caricamento Immagine", significa che manca la colonna `user_id` nel DB (Riesegui SQL punto 1).
4.  **Upload Listini:**
    *   Prova a caricare un CSV listino.
    *   Richiede `SUPABASE_SERVICE_ROLE_KEY` settata su Vercel.

---

**Tutto Verde?** 🟢 La piattaforma è in produzione e sicura.
