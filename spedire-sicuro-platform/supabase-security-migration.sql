-- ============================================================================
-- SECURITY MIGRATION SCRIPT - Spedire Sicuro Platform
-- ============================================================================
-- Questo script migra il sistema di autenticazione da hardcoded admin emails
-- a un sistema basato su roles nel database, e implementa RLS policies sicure.
--
-- IMPORTANTE: Esegui questo script in Supabase SQL Editor
-- ============================================================================

-- ============================================================================
-- STEP 1: Crea tabella user_roles per gestire permessi
-- ============================================================================

CREATE TABLE IF NOT EXISTS user_roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('admin', 'operator', 'viewer')),
  created_at TIMESTAMP DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, role)
);

-- Indice per performance
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON user_roles(role);

-- Trigger per aggiornare updated_at
CREATE OR REPLACE FUNCTION update_user_roles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_user_roles_updated_at ON user_roles;
CREATE TRIGGER update_user_roles_updated_at
    BEFORE UPDATE ON user_roles
    FOR EACH ROW
    EXECUTE FUNCTION update_user_roles_updated_at();

-- ============================================================================
-- STEP 2: Inserisci admin iniziali (PERSONALIZZA QUESTI EMAIL!)
-- ============================================================================
-- IMPORTANTE: Sostituisci questi email con quelli degli admin effettivi

DO $$
BEGIN
  -- Admin 1: admin@spediresicuro.com
  IF EXISTS (SELECT 1 FROM auth.users WHERE email = 'admin@spediresicuro.com') THEN
    INSERT INTO user_roles (user_id, role, created_by)
    SELECT id, 'admin', id FROM auth.users WHERE email = 'admin@spediresicuro.com'
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;

  -- Admin 2: info@gdsgroup.it
  IF EXISTS (SELECT 1 FROM auth.users WHERE email = 'info@gdsgroup.it') THEN
    INSERT INTO user_roles (user_id, role, created_by)
    SELECT id, 'admin', id FROM auth.users WHERE email = 'info@gdsgroup.it'
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;

  -- Admin 3: gdsgroupsas@gmail.com
  IF EXISTS (SELECT 1 FROM auth.users WHERE email = 'gdsgroupsas@gmail.com') THEN
    INSERT INTO user_roles (user_id, role, created_by)
    SELECT id, 'admin', id FROM auth.users WHERE email = 'gdsgroupsas@gmail.com'
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
END $$;

-- ============================================================================
-- STEP 3: Helper function per verificare se un utente è admin
-- ============================================================================

CREATE OR REPLACE FUNCTION is_admin(user_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = user_uuid AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- STEP 4: ELIMINA le vecchie policy insicure
-- ============================================================================

DROP POLICY IF EXISTS "Allow all operations on spedizioni" ON spedizioni;
DROP POLICY IF EXISTS "Allow all operations on listini_corrieri" ON listini_corrieri;
DROP POLICY IF EXISTS "Allow all operations on log_operazioni" ON log_operazioni;

-- ============================================================================
-- STEP 5: Implementa RLS policies sicure per SPEDIZIONI
-- ============================================================================

-- Lettura: tutti gli utenti autenticati possono leggere le proprie spedizioni
-- NOTA: Per ora permette lettura di tutte le spedizioni (single-tenant)
-- TODO: In futuro aggiungere colonna user_id per multi-tenant
CREATE POLICY "Authenticated users can read all spedizioni"
  ON spedizioni
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Inserimento: tutti gli utenti autenticati
CREATE POLICY "Authenticated users can insert spedizioni"
  ON spedizioni
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Aggiornamento: tutti gli utenti autenticati
-- TODO: Limitare a proprie spedizioni quando aggiungiamo user_id
CREATE POLICY "Authenticated users can update spedizioni"
  ON spedizioni
  FOR UPDATE
  USING (auth.uid() IS NOT NULL);

-- Eliminazione: solo admin
CREATE POLICY "Only admins can delete spedizioni"
  ON spedizioni
  FOR DELETE
  USING (is_admin(auth.uid()));

-- ============================================================================
-- STEP 6: Implementa RLS policies sicure per LISTINI_CORRIERI
-- ============================================================================

-- Lettura: tutti gli utenti autenticati possono vedere i listini
CREATE POLICY "Authenticated users can read listini_corrieri"
  ON listini_corrieri
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Inserimento: solo admin
CREATE POLICY "Only admins can insert listini_corrieri"
  ON listini_corrieri
  FOR INSERT
  WITH CHECK (is_admin(auth.uid()));

-- Aggiornamento: solo admin
CREATE POLICY "Only admins can update listini_corrieri"
  ON listini_corrieri
  FOR UPDATE
  USING (is_admin(auth.uid()));

-- Eliminazione: solo admin
CREATE POLICY "Only admins can delete listini_corrieri"
  ON listini_corrieri
  FOR DELETE
  USING (is_admin(auth.uid()));

-- ============================================================================
-- STEP 7: Implementa RLS policies sicure per LOG_OPERAZIONI
-- ============================================================================

-- Lettura: solo admin possono vedere i log
CREATE POLICY "Only admins can read log_operazioni"
  ON log_operazioni
  FOR SELECT
  USING (is_admin(auth.uid()));

-- Inserimento: tutti gli utenti autenticati (per logging automatico)
CREATE POLICY "Authenticated users can insert log_operazioni"
  ON log_operazioni
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Aggiornamento e eliminazione: solo admin
CREATE POLICY "Only admins can update log_operazioni"
  ON log_operazioni
  FOR UPDATE
  USING (is_admin(auth.uid()));

CREATE POLICY "Only admins can delete log_operazioni"
  ON log_operazioni
  FOR DELETE
  USING (is_admin(auth.uid()));

-- ============================================================================
-- STEP 8: RLS policies per USER_ROLES (gestione permessi)
-- ============================================================================

-- Abilita RLS
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- Lettura: gli utenti possono vedere i propri ruoli
CREATE POLICY "Users can read their own roles"
  ON user_roles
  FOR SELECT
  USING (user_id = auth.uid());

-- Admin possono leggere tutti i ruoli
CREATE POLICY "Admins can read all roles"
  ON user_roles
  FOR SELECT
  USING (is_admin(auth.uid()));

-- Solo admin possono gestire ruoli (insert/update/delete)
CREATE POLICY "Only admins can insert roles"
  ON user_roles
  FOR INSERT
  WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Only admins can update roles"
  ON user_roles
  FOR UPDATE
  USING (is_admin(auth.uid()));

CREATE POLICY "Only admins can delete roles"
  ON user_roles
  FOR DELETE
  USING (is_admin(auth.uid()));

-- ============================================================================
-- STEP 9: Verifica che RLS sia abilitato su tutte le tabelle
-- ============================================================================

ALTER TABLE spedizioni ENABLE ROW LEVEL SECURITY;
ALTER TABLE listini_corrieri ENABLE ROW LEVEL SECURITY;
ALTER TABLE log_operazioni ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- STEP 10: Verifica migration (Query di test)
-- ============================================================================

-- Verifica che la tabella user_roles esista
SELECT 'user_roles table exists' AS status, COUNT(*) AS admin_count
FROM user_roles WHERE role = 'admin';

-- Lista tutte le policy attive
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('spedizioni', 'listini_corrieri', 'log_operazioni', 'user_roles')
ORDER BY tablename, policyname;

-- ============================================================================
-- FINE MIGRATION
-- ============================================================================

-- NOTA IMPORTANTE:
-- Dopo aver eseguito questa migration, aggiorna il codice in:
-- /app/api/listini/upload/route.ts
-- Sostituisci la funzione checkAdminAuth per usare la tabella user_roles
-- invece dell'array hardcoded ADMIN_EMAILS.
--
-- Esempio:
-- const { data: roles } = await supabase
--   .from('user_roles')
--   .select('role')
--   .eq('user_id', user.id)
--   .eq('role', 'admin')
--   .single()
-- return !!roles
