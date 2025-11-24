-- Aggiunge la colonna status alla tabella spedizioni
-- Questa colonna tiene traccia dello stato della spedizione

ALTER TABLE spedizioni
ADD COLUMN IF NOT EXISTS status text DEFAULT 'bozza';

-- Aggiungi un indice per migliorare le performance delle query per status
CREATE INDEX IF NOT EXISTS idx_spedizioni_status ON spedizioni(status);

-- Commento sulla colonna per documentazione
COMMENT ON COLUMN spedizioni.status IS 'Stato della spedizione: bozza, export_csv, inviata, consegnata, etc.';