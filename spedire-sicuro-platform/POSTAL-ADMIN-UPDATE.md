# 🏤 MODULE: POSTALE ADMIN (CFO LAYER)

**Status:** 🚧 IN PROGRESS (Backend Logic Ready)
**Role:** SuperAdmin / CFO Tool
**Objective:** Gestione contabile PostaBase Mini con credito a scalare.

## 🛠️ CHANGELOG

### 1. Database Evolution (`supabase/migrations/20251123_postale_admin.sql`)
*   **New Table:** `fondo_cassa_postale`
    *   `saldo_attuale` (Numeric, Check >= 0)
    *   Traccia il "portafoglio" dell'agenzia per le affrancature.
*   **Table Update:** `spedizioni_postali`
    *   Added `is_agency_operation` (Boolean) -> Distingue op interne da servizi clienti.
    *   Added `costo_effettivo_spedire_sicuro` (COGS).
    *   Added `margine_lordo` (Profitto).
*   **Security:** RLS policies enabled (attualmente su `authenticated` per dev, da restringere ad `admin`).

### 2. Backend Logic (`lib/postal-service.ts`)
*   **Transazione Atomica (Simulata):**
    *   La funzione `registraSpedizionePostaleAdmin` ora esegue un controllo rigoroso del credito (`RED ALERT CASH FLOW`) prima di procedere.
    *   Esegue l'aggiornamento del saldo e il log della spedizione in sequenza protetta.
    *   Include logica di rollback manuale in caso di incoerenza (Insert fallito dopo Update saldo).

### 3. Types (`lib/types.ts`)
*   Aggiunti tipi `FondoCassaPostale` e `SpedizionePostale` per TypeScript strong typing.

## 🚀 NEXT STEPS (User Action Required)

1.  **Esegui SQL:** Copia ed esegui il contenuto di `supabase/migrations/20251123_postale_admin.sql` nella SQL Dashboard di Supabase.
2.  **Frontend Integration:** Collegare la nuova funzione `getPostalPnlMetrics` alla Dashboard Admin per mostrare il "Semaforo Saldo".
