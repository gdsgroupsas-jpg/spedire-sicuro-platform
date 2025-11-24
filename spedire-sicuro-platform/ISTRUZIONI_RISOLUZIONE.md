# 🛠️ Risoluzione Errore: "Could not find the 'status' column..."

L'errore segnalato ("Could not find the 'status' column of 'spedizioni' in the schema cache") indica che la tabella `spedizioni` nel database Supabase non è aggiornata con le ultime colonne richieste dall'applicazione (in particolare la colonna `status` usata per le bozze/export).

## ✅ Soluzione Rapida

Ho preparato due file SQL che risolvono il problema aggiungendo tutte le colonne potenzialmente mancanti (`status`, `colli`, `note`, ecc.).

### Opzione 1: Esegui lo script di fix completo (Consigliato)
1. Vai nella **Dashboard di Supabase** > **SQL Editor**.
2. Crea una nuova query.
3. Copia e incolla il contenuto del file: `supabase/supabase-fix.sql`.
4. Esegui la query.

### Opzione 2: Esegui solo la migrazione specifica
Se preferisci applicare solo le modifiche alla tabella spedizioni:
1. Vai nella **Dashboard di Supabase** > **SQL Editor**.
2. Copia e incolla il contenuto del file: `supabase/migrations/20251124_add_status_to_spedizioni.sql`.
3. Esegui la query.

Dopo aver eseguito uno di questi script, l'errore dovrebbe scomparire e il salvataggio della spedizione funzionerà correttamente.
