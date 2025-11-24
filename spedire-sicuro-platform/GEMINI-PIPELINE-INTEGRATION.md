# 🚀 GEMINI AGENT PROTOCOL: PROFIT LOGIC INTEGRATION

**Status:** ✅ COMPLETED
**Date:** 2025-11-23
**Agent:** Gemini-3-Pro-Preview

## 📝 OVERVIEW
L'obiettivo di questa sessione è stato ristrutturare la pipeline OCR per integrare la logica deterministica di calcolo del profitto (prezzi, margini) separandola dall'estrazione dati AI.

Sono state implementate due fasi principali:
1.  **PHASE 1 (Core Logic API):** Esposizione della logica di confronto prezzi tramite endpoint dedicato.
2.  **PHASE 2 (Pipeline Orchestration):** Aggiornamento dell'endpoint OCR per usare un flusso sequenziale: Estrazione (Simulata/AI) -> Calcolo Prezzi (Internal API).

---

## ⚙️ TECHNICAL IMPLEMENTATION

### 1. API Compare (`app/api/compare/route.ts`)
Questo endpoint è stato rifattorizzato per gestire richieste batch e utilizzare la logica server-side sicura.

*   **Batch Processing:** Accetta ora un array di oggetti `PriceCheckInput` per processare più spedizioni in parallelo.
*   **Supabase Server Client:** Utilizza `createBrowserClient` (da `@supabase/ssr`) con gestione cookies per garantire la sicurezza e il contesto utente.
*   **Logic:** Invoca `comparaPrezzi` da `lib/utils/compare-prices.ts` per calcolare:
    *   Miglior corriere per zona/peso.
    *   Markup (35%) e Margine.
    *   Ordina le opzioni per prezzo.
*   **Output:** Restituisce l'input originale arricchito con `opzioni` (lista completa) e `miglior_prezzo`.

### 2. API OCR (`app/api/ocr/route.ts`)
La pipeline è stata modificata per spostare la "business logic" dei prezzi fuori dall'AI.

*   **AI Simulation:** Implementata funzione `callExternalAI` (stub) che simula l'estrazione di dati da un'immagine (con ritardo artificiale di 1.5s). Questo permette di testare il flusso senza consumare token API reali in fase di sviluppo pipeline.
*   **Workflow:**
    1.  Ricezione File/JSON (Image).
    2.  Estrazione Dati (Simulazione AI).
    3.  **Chiamata Interna:** Fetch a `/api/compare` passando i dati estratti.
    4.  Aggregazione risultati.
*   **Separation of Concerns:** L'OCR si occupa solo di "vedere", la Compare API si occupa di "contare".

---

## 🧪 VERIFICATION STEPS

Per verificare la nuova pipeline:

1.  **Test OCR Endpoint:**
    *   Inviare una POST a `/api/ocr` con un'immagine (FormData o JSON).
    *   Attendersi una risposta JSON che contiene sia i dati "estratti" (Mario Rossi, Napoli...) sia l'oggetto `opzioni` con i prezzi calcolati.

2.  **Test Compare Endpoint:**
    *   Inviare una POST a `/api/compare` con un JSON array:
        ```json
        [
          { "cap": "00100", "provincia": "RM", "peso": 5, "contrassegno": "0.00" }
        ]
        ```
    *   Verificare che restituisca le opzioni di spedizione con i prezzi corretti.

---

## 📂 FILES MODIFIED

*   `app/api/compare/route.ts` (Refactored for Batch & SSR)
*   `app/api/ocr/route.ts` (Updated Pipeline Logic)
*   `vercel.json` (Infrastructure: Fixed Redirects 308)

## 🔜 NEXT STEPS
*   Sostituire la funzione `callExternalAI` in `app/api/ocr/route.ts` con la chiamata reale ad Anthropic/Gemini una volta validato il flusso dei prezzi.
*   Implementare test di unità per `comparePrices`.
