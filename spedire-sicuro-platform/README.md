# 🚀 Spedire Sicuro Platform v2.0

Piattaforma intelligente per gestione spedizioni con OCR AI e comparatore prezzi automatico **con sistema listini dinamico**.

## ✨ Features

- 📸 **OCR Screenshot WhatsApp** - Claude Vision legge automaticamente gli ordini
- 💰 **Comparatore Prezzi Dinamico** - Confronta automaticamente tutti i corrieri caricati
- 📋 **Gestione Listini** - Upload CSV/Excel per aggiungere nuovi corrieri
- 🔄 **Sistema Flessibile** - Nessun listino hard-coded, tutto gestito via database
- 📊 **Calcolo Margini Automatico** - Real-time per ogni corriere
- 📥 **Export CSV** - Formato Spedisci.online pronto all'uso
- ⚡ **Real-time** - Elaborazione immediata con AI

## 🛠️ Tech Stack

- **Framework**: Next.js 14 + TypeScript
- **Styling**: Tailwind CSS + Shadcn/ui
- **AI**: Claude Sonnet 4 (Anthropic)
- **Database**: Supabase (PostgreSQL)
- **Deploy**: Vercel

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Apri [http://localhost:3000/dashboard](http://localhost:3000/dashboard)

## 📋 Setup Database

1. **Crea progetto Supabase** su [supabase.com](https://supabase.com)

2. **Esegui lo schema SQL**:
   - Vai su SQL Editor in Supabase
   - Copia e incolla il contenuto di `supabase-schema.sql`
   - Esegui lo script

3. **Configura variabili ambiente** (`.env.local`):
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ANTHROPIC_API_KEY=your_claude_api_key
   ```

## 📸 Come Funziona

1. **Upload Screenshot** - Trascina screenshot ordine WhatsApp
2. **AI Estrae Dati** - Claude Vision legge destinatario, indirizzo, peso, etc
3. **Comparazione Prezzi** - Sistema confronta tutti i corrieri caricati automaticamente
4. **Download CSV** - Scarica file pronto per Spedisci.online

## 📋 Gestione Listini

### Carica Nuovo Listino

1. Vai su `/listini`
2. Compila:
   - **Fornitore**: Nome corriere (es: "Speedgo", "Spedizioni Prime")
   - **Servizio**: Tipo servizio (es: "GLS BA", "PD1", "SDA H24+")
   - **File**: CSV o Excel con i prezzi

### Formato File Listino

Il file CSV/Excel deve contenere almeno:

- **Colonne Peso**: `peso_min`, `peso_max` (o varianti: "peso minimo", "peso massimo", "da", "a")
- **Colonne Zone**: Prezzi per zona (es: `italia`, `sardegna`, `sicilia`, `calabria`)

**Esempio CSV:**
```csv
peso_min;peso_max;italia;sardegna;sicilia;calabria
0;3;3.50;4.26;3.50;3.61
3;5;3.50;4.26;3.50;3.61
5;12;6.82;9.50;8.90;8.90
```

Il sistema riconosce automaticamente colonne con nomi diversi (es: "Peso Min", "Italia", "Sardegna", etc.)

### Attiva/Disattiva Listini

Dalla pagina `/listini` puoi:
- ✅ Attivare/disattivare listini
- 🗑️ Eliminare listini
- 👁️ Visualizzare dettagli

## 🔑 Environment Variables

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
ANTHROPIC_API_KEY=your_claude_api_key
```

## 📊 Struttura Database

### Tabella `spedizioni`
Contiene tutte le spedizioni processate con dati OCR e confronto prezzi.

### Tabella `listini_corrieri`
Contiene i listini caricati in formato JSONB flessibile:
- `dati_listino`: Struttura prezzi (fasce peso, zone)
- `regole_contrassegno`: Logica calcolo contrassegno
- `attivo`: Flag per attivare/disattivare

### Tabella `log_operazioni`
Log di tutte le operazioni (OCR, compare, upload listini)

## 🎯 API Routes

- `POST /api/ocr` - Elabora screenshot WhatsApp
- `POST /api/compare` - Confronta prezzi tra corrieri
- `POST /api/listini/upload` - Carica nuovo listino
- `GET /api/listini` - Lista tutti i listini
- `PUT /api/listini` - Aggiorna listino (attiva/disattiva)
- `DELETE /api/listini` - Elimina listino
- `POST /api/csv` - Export CSV formato spedisci.online

## 🚀 Deploy

### Vercel (Consigliato)

1. Push su GitHub
2. Import su Vercel
3. Configura environment variables
4. Deploy automatico

Vedi `DEPLOY.md` per dettagli completi.

## 🐛 Troubleshooting

**Errore "Nessun listino attivo trovato"**
→ Carica almeno un listino da `/listini`

**Errore upload CSV**
→ Verifica formato file (deve avere colonne peso e zone)

**Errore OCR**
→ Controlla che l'immagine sia leggibile e contenga dati spedizione

## 📝 Note Tecniche

- Il sistema supporta listini con strutture diverse (il parser è intelligente)
- I prezzi vengono calcolati dinamicamente in base a peso, provincia e contrassegno
- Tutti i dati sono salvati su Supabase per storico e analisi

## 📞 Support

Per problemi o domande, contatta il team di sviluppo.

---

**Versione**: 2.0  
**Ultimo aggiornamento**: 2025  
**Sistema listini**: Dinamico (database-driven)
