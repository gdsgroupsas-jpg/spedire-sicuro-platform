# Fix: Colonna 'status' mancante in spedizioni

## Problema Identificato
L'errore "Could not find the 'status' column of 'spedizioni' in the schema cache" si verifica perché il codice cerca di salvare un campo `status` nella tabella `spedizioni`, ma questa colonna non esiste nel database.

## Soluzione Implementata

### 1. Migrazione Database Creata
Ho creato il file di migrazione: `supabase/migrations/20251124_add_status_column.sql`

Questo file aggiunge:
- La colonna `status` con valore di default 'bozza'
- Un indice per migliorare le performance
- Documentazione inline

### 2. Schema Aggiornato
Ho aggiornato il file `supabase-schema.sql` per includere:
- La colonna `status`
- Tutti i campi del mittente (già presenti da una migrazione precedente)

## Come Applicare la Fix

### Opzione 1: Tramite Supabase SQL Editor (CONSIGLIATO)

1. Vai su Supabase Dashboard → SQL Editor
2. Esegui questo comando SQL:

```sql
-- Aggiunge la colonna status alla tabella spedizioni
ALTER TABLE spedizioni
ADD COLUMN IF NOT EXISTS status text DEFAULT 'bozza';

-- Aggiungi un indice per migliorare le performance
CREATE INDEX IF NOT EXISTS idx_spedizioni_status ON spedizioni(status);

-- Commento sulla colonna per documentazione
COMMENT ON COLUMN spedizioni.status IS 'Stato della spedizione: bozza, export_csv, inviata, consegnata, etc.';
```

### Opzione 2: Se hai Supabase CLI configurato

```bash
cd spedire-sicuro-platform
npx supabase db push
```

## Stati Disponibili
Il campo `status` può assumere i seguenti valori:
- `bozza` - Spedizione salvata ma non ancora processata
- `export_csv` - Spedizione salvata ed esportata come CSV
- `inviata` - Spedizione inviata al corriere
- `in_transito` - Spedizione in viaggio
- `consegnata` - Spedizione consegnata
- `annullata` - Spedizione annullata

## Verifica
Dopo aver applicato la migrazione:
1. Torna alla pagina di creazione spedizione
2. Compila i campi richiesti
3. Clicca su "Crea Spedizione" o "Salva & Export CSV"
4. La spedizione dovrebbe essere salvata correttamente senza errori

## Note
- La migrazione usa `IF NOT EXISTS` quindi è sicura da eseguire multiple volte
- Il valore di default è 'bozza' per mantenere la retrocompatibilità