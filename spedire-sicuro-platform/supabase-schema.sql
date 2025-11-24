-- Schema Database Supabase per Spedire Sicuro Platform v2.0
-- Esegui questo script nella SQL Editor di Supabase

-- Tabella spedizioni (aggiornata)
CREATE TABLE IF NOT EXISTS spedizioni (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP DEFAULT NOW(),
  destinatario TEXT NOT NULL,
  indirizzo TEXT NOT NULL,
  cap TEXT NOT NULL,
  localita TEXT NOT NULL,
  provincia TEXT NOT NULL,
  country TEXT DEFAULT 'IT',
  peso DECIMAL(6,2) NOT NULL,
  colli INTEGER DEFAULT 1,
  contrassegno DECIMAL(10,2) DEFAULT 0,
  telefono TEXT,
  email_destinatario TEXT,
  contenuto TEXT,
  order_id TEXT,
  rif_mittente TEXT,
  rif_destinatario TEXT,
  note TEXT,
  corriere_scelto TEXT,
  servizio_scelto TEXT,
  prezzo_finale DECIMAL(10,2),
  immagine_url TEXT,
  dati_ocr JSONB,
  confronto_prezzi JSONB,
  status TEXT NOT NULL DEFAULT 'bozza'
);

-- Tabella listini corrieri (NUOVA - struttura flessibile)
CREATE TABLE IF NOT EXISTS listini_corrieri (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  fornitore TEXT NOT NULL,        -- es: "Speedgo", "Spedizioni Prime"
  servizio TEXT NOT NULL,          -- es: "GLS BA", "PD1", "SDA H24+"
  attivo BOOLEAN DEFAULT true,
  file_originale TEXT,             -- nome file caricato
  dati_listino JSONB NOT NULL,     -- struttura prezzi completa
  regole_contrassegno JSONB,       -- logica calcolo contrassegno
  zone_coperte TEXT[],             -- array zone (italia, sardegna, sicilia, etc)
  peso_max DECIMAL(6,2),
  note TEXT
);

-- Tabella log operazioni
CREATE TABLE IF NOT EXISTS log_operazioni (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  timestamp TIMESTAMP DEFAULT NOW(),
  tipo TEXT, -- 'OCR', 'COMPARE', 'EXPORT', 'UPLOAD_LISTINO'
  dettagli JSONB,
  esito TEXT -- 'success', 'error'
);

-- Indici per performance
CREATE INDEX IF NOT EXISTS idx_listini_fornitore ON listini_corrieri(fornitore);
CREATE INDEX IF NOT EXISTS idx_listini_attivo ON listini_corrieri(attivo);
CREATE INDEX IF NOT EXISTS idx_listini_fornitore_servizio ON listini_corrieri(fornitore, servizio);
CREATE INDEX IF NOT EXISTS idx_spedizioni_created ON spedizioni(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_log_timestamp ON log_operazioni(timestamp DESC);

-- Funzione per aggiornare updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger per aggiornare updated_at
DROP TRIGGER IF EXISTS update_listini_corrieri_updated_at ON listini_corrieri;
CREATE TRIGGER update_listini_corrieri_updated_at
    BEFORE UPDATE ON listini_corrieri
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- RLS (Row Level Security) - abilita se necessario
ALTER TABLE spedizioni ENABLE ROW LEVEL SECURITY;
ALTER TABLE listini_corrieri ENABLE ROW LEVEL SECURITY;
ALTER TABLE log_operazioni ENABLE ROW LEVEL SECURITY;

-- Policy per accesso pubblico (modifica secondo le tue esigenze)
CREATE POLICY "Allow all operations on spedizioni" ON spedizioni FOR ALL USING (true);
CREATE POLICY "Allow all operations on listini_corrieri" ON listini_corrieri FOR ALL USING (true);
CREATE POLICY "Allow all operations on log_operazioni" ON log_operazioni FOR ALL USING (true);

