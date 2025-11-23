# ⚡ Quick Start - Test Immediato

## 1️⃣ Crea File `.env.local`

Nella directory `spedire-sicuro-platform`, crea un file `.env.local` con questo contenuto:

```bash
# Anthropic Claude API Key
ANTHROPIC_API_KEY=your_anthropic_api_key_here

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

**Per ottenere la Supabase Anon Key:**
1. Vai su: https://supabase.com/dashboard/project/mckroxzkwagtmtmvhvvq/settings/api
2. Copia la chiave `anon` public

## 2️⃣ Setup Database Supabase

**IMPORTANTE:** Prima di testare, esegui lo schema SQL:

1. Vai su: https://supabase.com/dashboard/project/mckroxzkwagtmtmvhvvq/editor
2. Apri **SQL Editor**
3. Copia e incolla il contenuto di `supabase-schema.sql`
4. Clicca **Run** (o F5)

## 3️⃣ Avvia Server

```bash
cd spedire-sicuro-platform
npm run dev
```

Dovresti vedere:
```
✓ Ready in X.Xs
```

Apri: http://localhost:3000/dashboard

## 4️⃣ Test OCR

### Opzione A: Screenshot Reale
1. Prendi uno screenshot WhatsApp con un ordine
2. Vai su `/dashboard`
3. Trascina l'immagine nell'area upload
4. Attendi elaborazione AI

### Opzione B: Test Rapido
Crea un'immagine con questo testo:

```
Mario Rossi
Via Roma, 20
58100 Grosseto (GR)
Tel: 333 555 6666
Peso: 2kg
Contrassegno: 25,50€
Contenuto: Scarpe sportive
```

Salvala come `test-spedizione.jpg` e caricala.

## 5️⃣ Carica Primo Listino

**IMPORTANTE:** Prima di testare OCR, carica almeno un listino!

1. Vai su `/listini`
2. Compila:
   - **Fornitore**: `Speedgo`
   - **Servizio**: `GLS BA`
   - **File**: Carica un CSV con questo formato:

```csv
peso_min;peso_max;italia;sardegna;sicilia;calabria
0;3;3.50;4.26;3.50;3.61
3;5;3.50;4.26;3.50;3.61
5;12;6.82;9.50;8.90;8.90
12;18;9.40;12.29;11.59;11.59
18;30;16.70;21.41;20.81;20.81
```

3. Clicca "Carica Listino"
4. Verifica che appaia nella lista come "ATTIVO"

## ✅ Checklist Pre-Test

- [ ] File `.env.local` creato con tutte le chiavi
- [ ] Schema SQL eseguito su Supabase
- [ ] Server avviato (`npm run dev`)
- [ ] Almeno un listino caricato da `/listini`
- [ ] Screenshot test pronto

## 🐛 Problemi Comuni

**Errore: "Nessun listino attivo trovato"**
→ Carica almeno un listino da `/listini`

**Errore: "Invalid API Key"**
→ Verifica `.env.local` e riavvia il server

**Errore: "Cannot connect to Supabase"**
→ Verifica URL e Anon Key in `.env.local`

**Server non parte**
→ Verifica di essere nella directory corretta: `spedire-sicuro-platform`

---

**Pronto per il test!** 🚀

