# 🚨 FIX REPORT: Diagnostica e Risoluzione Errori Spedizione/CSV

Questo documento serve all'Agent Comet per identificare e risolvere rapidamente malfunzionamenti nel modulo "Crea Spedizione" appena implementato.

## 🔍 Sintomi Segnalati (Da Verificare)
- [ ] Errore durante il salvataggio su Supabase (Permission denied / RLS?)
- [ ] Errore nel download CSV (Blob non generato?)
- [ ] Errore di validazione Form (Zod schema troppo rigido?)
- [ ] Errore di rendering pagina (Componenti Shadcn mancanti?)

## 🛠️ Checklist di Risoluzione Automatica

### 1. Verifica Tabelle Database (Supabase)
L'errore più probabile è che la tabella `spedizioni` non abbia le colonne nuove o le policy RLS corrette per l'inserimento.

**Azione Richiesta:**
Eseguire questa query SQL nell'Editor SQL di Supabase per allineare lo schema:

```sql
-- Aggiungi colonne mancanti se necessario
ALTER TABLE spedizioni ADD COLUMN IF NOT EXISTS colli integer DEFAULT 1;
ALTER TABLE spedizioni ADD COLUMN IF NOT EXISTS rif_mittente text;
ALTER TABLE spedizioni ADD COLUMN IF NOT EXISTS rif_destinatario text;
ALTER TABLE spedizioni ADD COLUMN IF NOT EXISTS note text;
ALTER TABLE spedizioni ADD COLUMN IF NOT EXISTS telefono text;
ALTER TABLE spedizioni ADD COLUMN IF NOT EXISTS email_destinatario text;
ALTER TABLE spedizioni ADD COLUMN IF NOT EXISTS contenuto text;
ALTER TABLE spedizioni ADD COLUMN IF NOT EXISTS order_id text;
ALTER TABLE spedizioni ADD COLUMN IF NOT EXISTS status text DEFAULT 'bozza';

-- Verifica Policies (RLS)
-- Assicurati che l'utente autenticato possa fare INSERT
CREATE POLICY "Enable insert for authenticated users only" ON "public"."spedizioni"
AS PERMISSIVE FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Enable read for authenticated users only" ON "public"."spedizioni"
AS PERMISSIVE FOR SELECT
TO authenticated
USING (true);
```

### 2. Debug Form Client-Side
Se il form non invia dati, controllare la Console del browser (F12).

*   **Errore Zod:** Se i campi diventano rossi ma non c'è messaggio, verificare `form.formState.errors`.
*   **Errore CSV:** Controllare se `generateSpedisciCSV` riceve dati validi o `undefined`.

### 3. Verifica Componenti UI
Controllare se tutti i componenti `shadcn/ui` utilizzati sono installati:
*   `components/ui/textarea.tsx` (Spesso dimenticato)
*   `components/ui/label.tsx`
*   `components/ui/table.tsx`

**Comando di ripristino rapido:**
```bash
npx shadcn-ui@latest add textarea label table
```

## 🚀 Istruzioni per l'Agent
1.  Leggi i log di Vercel per l'errore esatto.
2.  Se è un errore di database (500), esegui l'SQL sopra.
3.  Se è un errore frontend, controlla la console e verifica l'installazione dei componenti.
4.  Verifica che `lib/adapters/spedisci-csv-adapter.ts` non abbia importazioni errate.

---
**Priorità:** ALTA (Bloccante per export ordini)
