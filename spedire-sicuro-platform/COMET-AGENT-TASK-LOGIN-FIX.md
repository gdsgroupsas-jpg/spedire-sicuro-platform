# 🤖 COMET AGENT PROTOCOL: LOGIN & REDIRECT FIX

**TARGET:** `app/login/page.tsx` e configurazione Supabase.
**PROBLEM:** L'utente segnala che la pagina di atterraggio dopo la registrazione/login è errata ("non è questa") o punta a un vecchio progetto.

---

## 🕵️ PHASE 1: DIAGNOSI URL & REDIRECT (Priority Alpha)

**Context:** Il link di conferma email generato da Supabase contiene un URL base. Se questo URL è sbagliato, l'utente finisce sul sito sbagliato.

**Action Required:**
1.  **Verifica Supabase Config:**
    *   Accedi alla Dashboard Supabase -> Auth -> URL Configuration.
    *   **CHECK:** Il `Site URL` deve essere ESATTAMENTE l'URL di produzione Vercel (es. `https://spedire-sicuro-platform.vercel.app`).
    *   **CHECK:** Se c'è `localhost` o un vecchio dominio, il link email porterà lì. CORREGGERE.

2.  **Verifica Codice Callback:**
    *   File: `app/auth/callback/route.ts`.
    *   Logica: Verifica che `NextResponse.redirect(${origin}${next})` usi l'origin corretto.
    *   **Fix:** Se necessario, forzare il redirect assoluto: `NextResponse.redirect(new URL('/dashboard', req.url))`.

---

## 🎨 PHASE 2: LOGIN PAGE UI/UX OVERHAUL

**Context:** L'utente potrebbe non riconoscere la pagina di login come quella "giusta" (design mismatch).

**Action Required:**
1.  **Target:** `app/login/page.tsx`.
2.  **Design Check:**
    *   Deve usare i colori brand (Giallo/Nero/Oro).
    *   Deve avere il logo `Spedire Sicuro`.
    *   Deve essere centrata e responsive.
3.  **Refactoring (Se necessario):**
    *   Sostituire il form attuale con una versione minimal e professionale.
    *   Rimuovere eventuali riferimenti a vecchi brand.

---

## 🧪 PHASE 3: TEST DI FLUSSO

**Esegui questi test:**
1.  Registrazione nuovo utente -> Email ricevuta? -> Link punta al dominio giusto?
2.  Click link -> Atterraggio su `/auth/callback` -> Redirect a `/dashboard`.
3.  Logout -> Redirect a `/login`.

---

## 📝 EXECUTION INSTRUCTIONS

Se sei l'Agente Comet:
1.  Chiedi all'utente l'URL esatto del progetto Vercel.
2.  Controlla se `app/login/page.tsx` corrisponde al mockup visivo atteso.
3.  Se il redirect è sbagliato, è al 99% un problema di configurazione Supabase, non di codice. Guida l'utente nel cambio del Site URL.
