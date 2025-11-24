# Analisi Errori API OCR - Progetto spedire-sicuro-platform

## Data Analisi
24 Novembre 2025

## 🔍 Errori Identificati

### 1. **ERRORE CRITICO: Mismatch Nome Variabile d'Ambiente**

**Problema:**
- Il codice in `app/api/ocr/route.ts` cerca la variabile `GEMINI_API_KEY` (linea 12)
- Il file `.env.local.example` definisce `GOOGLE_API_KEY` (linea 4)
- Su Vercel sono configurate **entrambe** le variabili: `GOOGLE_API_KEY` e `GEMINI_API_KEY`

**Impatto:**
- Confusione sulla variabile corretta da utilizzare
- Possibile fallimento dell'API se la variabile sbagliata è vuota

**Soluzione:**
Standardizzare su una singola variabile. Raccomandazione: usare `GOOGLE_API_KEY` perché è il nome ufficiale per Google AI Studio.

---

### 2. **ERRORE: Funzione OCR Simulata**

**Problema:**
La funzione `callGeminiVision()` (linee 22-51) **NON** chiama realmente l'API Gemini, ma restituisce dati mock/simulati.

```typescript
async function callGeminiVision(base64Image: string, mediaType: string): Promise<string> {
    if (!GEMINI_API_KEY) {
        throw new Error('GEMINI_API_KEY non configurata. Il flusso è bloccato.');
    }
    
    console.log('[OCR-GEMINI] Simulazione di estrazione AI in corso...');

    // Dati Estratti Simulati (JSON PURE, come richiesto dal prompt ottimizzato)
    const MOCK_JSON = {
        "destinatario": "Marco Rossi",
        "indirizzo": "Via della Logistica 42",
        // ... altri dati hardcoded
    };

    return JSON.stringify(MOCK_JSON);
}
```

**Impatto:**
- L'OCR **NON FUNZIONA** realmente
- Restituisce sempre gli stessi dati indipendentemente dall'immagine caricata
- Gli utenti vedono sempre "Marco Rossi" come destinatario

**Soluzione:**
Implementare la vera chiamata all'API Google Gemini Vision.

---

### 3. **ERRORE: Import Anthropic Commentato**

**Problema:**
Alla linea 2, l'import di Anthropic è commentato:
```typescript
// import Anthropic from '@anthropic-ai/sdk'  <-- RIMOSSO
```

Questo indica che il progetto è stato migrato da Anthropic Claude a Google Gemini, ma la migrazione non è stata completata.

---

### 4. **ERRORE: Documentazione Obsoleta**

**Problema:**
Il file `OCR-API-VERIFIED.md` afferma che l'API OCR è "COMPLETA E FUNZIONANTE" e menziona:
- Model: `claude-sonnet-4-20250514` (linea 22)
- Chiamata a Claude Vision API (linea 23)

Ma il codice attuale usa (o dovrebbe usare) Gemini, non Claude.

**Impatto:**
- Documentazione fuorviante
- Confusione per sviluppatori futuri

---

## 📊 Stato Variabili d'Ambiente Vercel

| Variabile | Stato | Ambiente |
|-----------|-------|----------|
| `GOOGLE_API_KEY` | ✅ Configurata | All Environments |
| `GEMINI_API_KEY` | ✅ Configurata | All Environments |
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ Configurata | All Environments |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ Configurata | All Environments |

**Nota:** La presenza di entrambe `GOOGLE_API_KEY` e `GEMINI_API_KEY` è ridondante e fonte di confusione.

---

## 🔧 Correzioni Necessarie

### Priorità Alta

1. **Implementare vera chiamata API Gemini**
   - Sostituire la funzione `callGeminiVision()` con una vera chiamata HTTP all'API Google Gemini
   - Utilizzare il formato corretto per Google AI Studio

2. **Standardizzare nome variabile**
   - Decidere se usare `GOOGLE_API_KEY` o `GEMINI_API_KEY`
   - Aggiornare codice e configurazione Vercel di conseguenza
   - Eliminare la variabile duplicata

3. **Aggiornare documentazione**
   - Correggere `OCR-API-VERIFIED.md` per riflettere l'uso di Gemini
   - Aggiornare `.env.local.example` con il nome corretto della variabile

### Priorità Media

4. **Verificare configurazione Supabase**
   - Testare la connessione al database
   - Verificare che le tabelle `spedizioni` e `listini_corrieri` esistano

5. **Testare integrazione completa**
   - Caricare un'immagine reale
   - Verificare che l'OCR estragga dati corretti
   - Controllare salvataggio su Supabase

---

## 📝 Raccomandazioni

1. **Usare `GOOGLE_API_KEY`** come nome standard (è il nome ufficiale di Google)
2. **Implementare la chiamata API reale** usando `@google/generative-ai` SDK o fetch diretto
3. **Aggiornare tutta la documentazione** per rimuovere riferimenti a Claude/Anthropic
4. **Testare end-to-end** prima di considerare l'API "verificata"

---

## 🚨 Messaggio di Errore Atteso

Quando un utente carica uno screenshot, vedrà il messaggio:
```
"Configurazione API mancante"
```

Se la variabile `GEMINI_API_KEY` non è impostata, oppure riceverà sempre gli stessi dati mock se la variabile è impostata.

---

## ✅ Prossimi Passi

1. Correggere il codice dell'API OCR
2. Aggiornare le variabili d'ambiente
3. Testare con immagini reali
4. Aggiornare la documentazione
5. Fare commit e push su GitHub
6. Verificare il deploy automatico su Vercel
