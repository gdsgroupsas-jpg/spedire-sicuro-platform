# 🔧 FIX REDIRECT & EMAIL VERIFICATION

Se dopo la registrazione vieni reindirizzato a un "vecchio progetto" o a un URL sbagliato, il problema è nella configurazione del **Site URL** su Supabase.

## 1. Correggere il Redirect (URL Sbagliato)

1.  Vai su **Supabase Dashboard**.
2.  Apri il tuo progetto.
3.  Vai su **Authentication** (icona utenti) -> **URL Configuration** (nel menu laterale).
4.  **Site URL:** Inserisci l'URL del tuo sito in produzione (es. `https://tua-app.vercel.app`).
5.  **Redirect URLs:** Aggiungi i seguenti URL alla whitelist:
    *   `https://tua-app.vercel.app/**`
    *   `http://localhost:3000/**` (per sviluppo locale)
6.  Salva.

**Nota:** Le email di conferma già inviate con il vecchio link non funzioneranno. Devi registrarti di nuovo o richiedere un nuovo link di conferma dopo aver cambiato questa impostazione.

## 2. Sistema di Doppia Verifica (Email Confirmation)

Il codice attuale supporta già la conferma email. Per assicurarti che sia attiva e obbligatoria:

1.  Vai su **Authentication** -> **Providers** -> **Email**.
2.  Assicurati che **Confirm email** sia su **ON**.
3.  Se vuoi la massima sicurezza, attiva anche **Secure email change** (ON).

### Come funziona ora:
1.  L'utente si registra.
2.  Il sistema crea l'utente ma non lo logga.
3.  L'utente riceve una mail.
4.  Clicca sul link -> Viene portato su `/auth/callback` nel nuovo sito.
5.  Viene loggato e reindirizzato alla Dashboard.
