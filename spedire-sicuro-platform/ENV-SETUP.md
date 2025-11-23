# 🔑 Setup File .env.local

## ✅ File Creato

Il file `.env.local` è stato creato nella root del progetto.

## ⚠️ AZIONE RICHIESTA: Completa Supabase Anon Key

La chiave `NEXT_PUBLIC_SUPABASE_ANON_KEY` nel file è **incompleta** (troncata).

### Come ottenere la chiave completa:

1. **Vai su Supabase Dashboard:**
   ```
   https://supabase.com/dashboard/project/wcnnvhysuwxamncbbwhq/settings/api
   ```

2. **Copia la chiave "anon public":**
   - È una stringa lunga (~300 caratteri)
   - Inizia con `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
   - Copia TUTTA la chiave (non solo l'inizio)

3. **Apri il file `.env.local`** in Cursor/VS Code

4. **Sostituisci** la riga:
   ```
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
   ```
   
   Con:
   ```
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
   ```

5. **Salva il file** (CTRL+S)

## 📋 Contenuto File .env.local

```bash
# Anthropic Claude API Key
ANTHROPIC_API_KEY=your_anthropic_api_key_here

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

## ✅ Verifica

Dopo aver completato la chiave, verifica con:

```powershell
cd spedire-sicuro-platform
Get-Content .env.local
```

Dovresti vedere tutte e 3 le variabili con valori completi.

## 🔄 Riavvia Server

**IMPORTANTE:** Dopo aver creato/modificato `.env.local`, **riavvia il server**:

```powershell
# Nel terminale dove gira npm run dev:
# Premi CTRL+C per fermare
# Poi riavvia:
npm run dev
```

Il server deve rilevare le nuove variabili ambiente.

## 🧪 Test Configurazione

Dopo il riavvio, testa l'endpoint:

```
http://localhost:3000/api/listini/upload
```

Dovresti vedere JSON con `supabase_configured: true`

---

**Prossimo step:** Completa la Supabase Anon Key e riavvia il server! 🚀

