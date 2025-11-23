# ✅ Verifica Setup - Checklist Rapida

## 1. File `.env.local` 

**Percorso:** `spedire-sicuro-platform/.env.local`

**Contenuto richiesto:**
```bash
ANTHROPIC_API_KEY=your_anthropic_api_key_here
NEXT_PUBLIC_SUPABASE_URL=https://mckroxzkwagtmtmvhvvq.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[LA TUA CHIAVE QUI]
```

**Come verificare:**
```powershell
cd spedire-sicuro-platform
Test-Path .env.local
```

Se restituisce `False`, crea il file manualmente.

## 2. Database Supabase

**URL Dashboard:** https://supabase.com/dashboard/project/mckroxzkwagtmtmvhvvq

**Verifica tabelle:**
1. Vai su **Table Editor**
2. Dovresti vedere:
   - ✅ `spedizioni`
   - ✅ `listini_corrieri`
   - ✅ `log_operazioni`

**Se mancano, esegui:**
1. Vai su **SQL Editor**
2. Copia contenuto di `supabase-schema.sql`
3. Clicca **Run**

## 3. Server Development

**Comando:**
```powershell
cd spedire-sicuro-platform
npm run dev
```

**Output atteso:**
```
▲ Next.js 14.0.4
- Local:        http://localhost:3000
✓ Ready in 2.3s
```

**Se vedi errori:**
- `Missing environment variables` → Verifica `.env.local`
- `Cannot find module` → Esegui `npm install`
- `Port 3000 already in use` → Cambia porta o chiudi altro processo

## 4. Test Connessione

**Apri browser:**
```
http://localhost:3000
```

Dovresti vedere la homepage.

**Vai a:**
```
http://localhost:3000/dashboard
```

Dovresti vedere la dashboard con area upload.

## 5. Primo Listino

**Vai a:**
```
http://localhost:3000/listini
```

**Crea file CSV test** (`test-listino.csv`):
```csv
peso_min;peso_max;italia;sardegna;sicilia;calabria
0;3;3.50;4.26;3.50;3.61
3;5;3.50;4.26;3.50;3.61
5;12;6.82;9.50;8.90;8.90
```

**Carica:**
- Fornitore: `Speedgo`
- Servizio: `GLS BA Test`
- File: `test-listino.csv`

**Verifica:**
- Listino appare nella lista
- Status: "ATTIVO" (verde)

## 6. Test OCR

**Prepara immagine:**
- Crea screenshot WhatsApp o usa `TEST-IMAGE-GUIDE.md`

**Test:**
1. Vai su `/dashboard`
2. Carica immagine
3. Attendi 5-10 secondi
4. Verifica:
   - ✅ Dati estratti correttamente
   - ✅ Comparazione prezzi mostra opzioni
   - ✅ Nessun errore in console (F12)

## 🐛 Troubleshooting Rapido

| Problema | Soluzione |
|----------|-----------|
| `.env.local` non trovato | Crea file manualmente nella root del progetto |
| "Nessun listino attivo" | Carica almeno un listino da `/listini` |
| Errore Supabase | Verifica URL e Anon Key in `.env.local` |
| Server non parte | Verifica di essere in `spedire-sicuro-platform` |
| OCR non funziona | Verifica `ANTHROPIC_API_KEY` in `.env.local` |

## 📞 Support

Se qualcosa non funziona:
1. Controlla console browser (F12)
2. Controlla terminale server
3. Verifica `.env.local`
4. Verifica database Supabase

---

**Tutto OK?** Procedi con il test OCR! 🚀

