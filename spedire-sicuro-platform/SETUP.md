# 🚀 Setup Completo - Spedire Sicuro Platform v2.0

## ✅ Checklist Setup

### 1. Database Supabase

1. Vai su [supabase.com](https://supabase.com) e crea un nuovo progetto
2. Copia l'URL e la chiave anonima
3. Apri **SQL Editor** in Supabase
4. Copia e incolla il contenuto di `supabase-schema.sql`
5. Esegui lo script (clicca "Run")

### 2. Environment Variables

Crea un file `.env.local` nella root del progetto:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=xxxx-service-role-key
GOOGLE_API_KEY=sk-google-ai-...
```

### 3. Installazione Dipendenze

```bash
npm install
```

### 4. Avvio Sviluppo

```bash
npm run dev
```

Apri [http://localhost:3000/dashboard](http://localhost:3000/dashboard)

## 📋 Primo Utilizzo

### Step 1: Carica un Listino

1. Vai su `/listini`
2. Compila:
   - **Fornitore**: es. "Speedgo"
   - **Servizio**: es. "GLS BA"
   - **File**: Carica un CSV o Excel con i prezzi
3. Clicca "Carica Listino"

### Step 2: Testa OCR

1. Vai su `/dashboard`
2. Carica uno screenshot WhatsApp con un ordine
3. L'AI estrarrà i dati automaticamente
4. Il sistema confronterà i prezzi con i listini caricati

### Step 3: Export CSV

1. Dopo l'OCR, clicca "Download CSV"
2. Il file sarà pronto per spedisci.online

## 📊 Formato CSV Listino

Il CSV deve avere almeno queste colonne:

```csv
peso_min;peso_max;italia;sardegna;sicilia;calabria
0;3;3.50;4.26;3.50;3.61
3;5;3.50;4.26;3.50;3.61
5;12;6.82;9.50;8.90;8.90
```

**Note:**
- Il sistema riconosce colonne con nomi diversi (es: "Peso Min", "Italia", etc.)
- Supporta anche Excel (.xlsx, .xls)
- Delimitatore: punto e virgola (;) o virgola (,)

## 🔧 Troubleshooting

### Errore "Nessun listino attivo trovato"
→ Carica almeno un listino da `/listini`

### Errore upload CSV
→ Verifica che il file abbia colonne per peso e zone

### Errore connessione Supabase
→ Controlla le variabili ambiente in `.env.local`

### Errore OCR
→ Verifica che l'API key di Google Gemini sia corretta

## 📁 Struttura File

```
/app
  /api
    /ocr          # API OCR con Google Gemini Vision
    /compare      # Comparatore prezzi dinamico
    /listini      # Gestione listini (GET/PUT/DELETE)
    /listini/upload # Upload listini
    /csv          # Export CSV
  /dashboard      # Dashboard principale
  /listini        # Pagina gestione listini
/lib
  /parsers        # Parser CSV/Excel
  /utils          # Utility comparazione prezzi
  types.ts        # TypeScript types
/components
  ListiniManager.tsx # Componente gestione listini
```

## 🎯 Prossimi Passi

1. ✅ Setup database Supabase
2. ✅ Carica primo listino
3. ✅ Testa OCR con screenshot
4. ✅ Verifica comparazione prezzi
5. ✅ Export CSV

## 📞 Support

Per problemi o domande, consulta il README.md principale.

---

**Versione**: 2.0  
**Sistema**: Listini dinamici (database-driven)  
**Status**: ✅ Pronto per produzione

