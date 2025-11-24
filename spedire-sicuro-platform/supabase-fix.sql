-- 1. Pulizia e Ricreazione Tabella Listini (Più permissiva)
DROP TABLE IF EXISTS listini_corrieri;

CREATE TABLE listini_corrieri (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    corriere TEXT NOT NULL,
    nome_servizio TEXT DEFAULT 'Standard',
    zona TEXT DEFAULT 'ITA',
    peso_min NUMERIC NOT NULL, -- Cambiato da DECIMAL a NUMERIC per flessibilità
    peso_max NUMERIC NOT NULL,
    prezzo NUMERIC NOT NULL,
    tempi_consegna TEXT DEFAULT '24/48h',
    note TEXT
);

-- 2. Abilita RLS
ALTER TABLE listini_corrieri ENABLE ROW LEVEL SECURITY;

-- 3. Policy "Open" per l'MVP (Permetti tutto agli utenti autenticati)
-- In produzione dovresti restringere l'upload solo agli admin
CREATE POLICY "Allow all actions for authenticated users" ON listini_corrieri
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- 4. Indici per performance ricerca
CREATE INDEX idx_listini_corriere ON listini_corrieri(corriere);
CREATE INDEX idx_listini_prezzo ON listini_corrieri(prezzo);
CREATE INDEX idx_listini_peso ON listini_corrieri(peso_min, peso_max);
