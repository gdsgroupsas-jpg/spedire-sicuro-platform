# ✅ Checklist Test - Spedire Sicuro Platform

## 🎯 Status Attuale

- ✅ File `.env.local` creato e configurato
- ✅ Server Next.js riavviato
- ✅ Variabili ambiente caricate
- ✅ API route `/api/listini/upload` aggiornata con logging
- ✅ Struttura progetto completa

## 🧪 Test 1: Verifica Configurazione API

### Step 1: Test Endpoint GET

**URL:** http://localhost:3000/api/listini/upload

**Risultato atteso:**
```json
{
  "success": true,
  "message": "API /api/listini/upload è attiva",
  "timestamp": "2025-01-27T...",
  "supabase_configured": true,
  "environment": "development"
}
```

**Se vedi `supabase_configured: true`** → ✅ Configurazione corretta!

**Se vedi `supabase_configured: false`** → ⚠️ Verifica `.env.local`

---

## 🧪 Test 2: Upload Listino CSV

### Step 1: Prepara File CSV

Crea un file `test-listino.csv` con questo contenuto:

```csv
peso_min;peso_max;italia;sardegna;sicilia;calabria
0;3;3.50;4.26;3.50;3.61
3;5;3.50;4.26;3.50;3.61
5;12;6.82;9.50;8.90;8.90
12;18;9.40;12.29;11.59;11.59
18;30;16.70;21.41;20.81;20.81
```

**Importante:**
- Separatore: `;` (punto e virgola)
- Prima riga: header
- Encoding: UTF-8
- Salva come `.csv`

### Step 2: Upload da UI

1. Vai su: http://localhost:3000/listini
2. Compila:
   - **Fornitore:** `Speedgo`
   - **Servizio:** `GLS BA`
   - **File:** Seleziona `test-listino.csv`
3. Clicca "Carica Listino"

### Step 3: Verifica Risultato

**Successo:**
- ✅ Messaggio "Listino caricato con successo"
- ✅ Listino appare nella lista come "ATTIVO"
- ✅ Console browser: nessun errore

**Errore:**
- ❌ Controlla console browser (F12) per dettagli
- ❌ Controlla terminale server per log `[UPLOAD]`

---

## 🧪 Test 3: Verifica Log Server

Nel terminale dove gira `npm run dev`, dovresti vedere:

```
[UPLOAD] POST request ricevuta
[UPLOAD] Content-Type: multipart/form-data
[UPLOAD] FormData ricevuto
[UPLOAD] Parametri: { fornitore: 'Speedgo', servizio: 'GLS BA', file: {...} }
[UPLOAD] Lettura file CSV...
[UPLOAD] File letto, dimensione: XXX caratteri
[UPLOAD] Headers trovati: ['peso_min', 'peso_max', 'italia', ...]
[UPLOAD] Parsing fasce peso...
[UPLOAD] Fasce totali parse: 5
[UPLOAD] Inserimento in Supabase...
[UPLOAD] Listino inserito con successo, ID: xxx
```

**Se vedi questi log** → ✅ Tutto funziona!

**Se vedi errori** → Controlla:
- Formato CSV corretto?
- Variabili Supabase configurate?
- Tabelle database create?

---

## 🧪 Test 4: Test OCR (Dopo Upload Listino)

### Prerequisito
- ✅ Almeno un listino caricato e attivo

### Step 1: Prepara Screenshot

Crea o usa uno screenshot WhatsApp con:
- Nome destinatario
- Indirizzo completo
- CAP e città
- Provincia (sigla 2 lettere)
- Peso (opzionale)
- Contrassegno (opzionale)

### Step 2: Upload OCR

1. Vai su: http://localhost:3000/dashboard
2. Trascina screenshot nell'area upload
3. Attendi elaborazione (5-10 secondi)

### Step 3: Verifica Risultato

**Successo:**
- ✅ Dati estratti correttamente
- ✅ Comparazione prezzi mostra opzioni
- ✅ Opzioni ordinate per prezzo
- ✅ Download CSV disponibile

---

## 🐛 Troubleshooting

### Errore: "Nessun listino attivo trovato"
**Causa:** Nessun listino caricato o tutti disattivati
**Soluzione:** Carica almeno un listino da `/listini`

### Errore: "Errore database"
**Causa:** Problema con Supabase
**Soluzione:**
- Verifica `.env.local` con chiavi complete
- Esegui schema SQL su Supabase
- Controlla connessione internet

### Errore: "Unexpected token '<'"
**Causa:** API restituisce HTML invece di JSON
**Soluzione:**
- Verifica che il server sia in esecuzione
- Svuota cache browser (CTRL+SHIFT+R)
- Controlla URL corretto

### Errore: "Parametri mancanti"
**Causa:** FormData incompleto
**Soluzione:**
- Verifica che fornitore, servizio e file siano tutti presenti
- Controlla nome campi nel form

---

## ✅ Checklist Completa

- [ ] Test endpoint GET: `supabase_configured: true`
- [ ] File CSV preparato con formato corretto
- [ ] Upload listino da `/listini` riuscito
- [ ] Listino appare come "ATTIVO"
- [ ] Log server mostrano parsing corretto
- [ ] Test OCR con screenshot
- [ ] Comparazione prezzi funziona
- [ ] Export CSV funziona

---

## 🎉 Quando Tutto Funziona

Se tutti i test passano:
- ✅ Sistema listini dinamico operativo
- ✅ OCR funzionante
- ✅ Comparatore prezzi attivo
- ✅ Export CSV pronto

**Pronto per produzione!** 🚀

---

**Prossimo step:** Inizia con Test 1 (verifica configurazione API)

