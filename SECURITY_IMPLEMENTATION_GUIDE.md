# 🔐 Security Implementation Guide

**Versione:** 1.0
**Data:** 2025-11-24
**Branch:** claude/security-audit-01WKcncRk5eGBBh5LcZYKaY2

---

## 📋 Panoramica

Questa guida spiega come completare l'implementazione delle security fixes dopo aver mergiato questo branch.

### Cosa è Stato Fatto Automaticamente ✅

- ✅ Aggiornate dipendenze vulnerabili (Next.js 14.0.4 → 14.2.30+)
- ✅ Aggiunta autenticazione a TUTTI gli endpoint API
- ✅ Implementata validazione input con Zod
- ✅ Aggiunta sanitizzazione per prompt AI (prevenzione injection)
- ✅ Implementata verifica firma webhook (HMAC SHA-256)
- ✅ Aggiunta validazione tipo e dimensione file
- ✅ Implementati security headers (CSP, X-Frame-Options, etc)
- ✅ Creata gestione errori sicura (non espone dettagli in production)
- ✅ Preparato script SQL per RLS policies e user_roles

### Cosa Devi Fare Manualmente ⚙️

1. Eseguire migration SQL su Supabase
2. Configurare variabili d'ambiente
3. Testare gli endpoint
4. Deploy in production

---

## 🚀 Step 1: Esecuzione Migration SQL

### 1.1 Accedi a Supabase Dashboard

```bash
1. Vai su https://supabase.com/dashboard
2. Seleziona il tuo progetto
3. Click su "SQL Editor" nel menu laterale
```

### 1.2 Esegui lo Script di Migration

```bash
1. Apri il file: supabase-security-migration.sql
2. Copia TUTTO il contenuto
3. Incolla nell'editor SQL di Supabase
4. PERSONALIZZA gli email admin (linee 51-70)
5. Click su "Run" per eseguire
```

**IMPORTANTE:** Prima di eseguire, modifica questi email con quelli reali:

```sql
-- Riga 53-55
IF EXISTS (SELECT 1 FROM auth.users WHERE email = 'admin@spediresicuro.com') THEN
  -- Sostituisci con email reale
```

### 1.3 Verifica Migration Riuscita

Esegui questa query per verificare:

```sql
-- Dovrebbe mostrare almeno 1 admin
SELECT * FROM user_roles WHERE role = 'admin';

-- Dovrebbe mostrare le nuove policy
SELECT tablename, policyname
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('spedizioni', 'listini_corrieri', 'log_operazioni', 'user_roles')
ORDER BY tablename, policyname;
```

**Output atteso:**
- 1-3 righe nella tabella `user_roles` con role='admin'
- Circa 15 policy nuove create

---

## 🔑 Step 2: Configurazione Variabili d'Ambiente

### 2.1 Variabili Esistenti (Già Configurate)

Queste dovrebbero già essere configurate in Vercel/local:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...  # ⚠️ SENSIBILE
GOOGLE_API_KEY=AIzaSy...              # ⚠️ SENSIBILE
```

### 2.2 Nuova Variabile da Aggiungere: WEBHOOK_SECRET

**Genera il secret:**

```bash
# Su Mac/Linux
openssl rand -hex 32

# Output esempio:
# a3f7c9e2d1b8f4a6e9c7d2b5f8a3e6c9d2b5f8a3e6c9d2b5f8a3e6c9d2b5

# Su Windows PowerShell
[System.Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
```

**Aggiungi a Vercel:**

```bash
1. Vai su Vercel Dashboard → tuo progetto
2. Click su "Settings" → "Environment Variables"
3. Aggiungi:
   - Name: WEBHOOK_SECRET
   - Value: [il secret generato sopra]
   - Environments: Production, Preview, Development
4. Click "Save"
```

**Aggiungi a .env.local (development):**

```bash
# .env.local
WEBHOOK_SECRET=a3f7c9e2d1b8f4a6e9c7d2b5f8a3e6c9d2b5f8a3e6c9d2b5f8a3e6c9d2b5
```

### 2.3 Verifica ENV Variables

Dopo deploy, verifica che tutte le variabili siano configurate:

```bash
# In development
npm run dev
# Controlla che non ci siano errori di "missing env variable"

# In production (Vercel)
# Check Deployment Logs per confermare che tutte le ENV vars siano caricate
```

---

## 🧪 Step 3: Testing

### 3.1 Test Autenticazione Endpoint

**Test 1: Endpoint NON autenticato deve fallire**

```bash
# Dovrebbe ritornare 401 Unauthorized
curl -X POST https://your-app.vercel.app/api/ocr \
  -H "Content-Type: application/json" \
  -d '{}'

# Expected output:
# {"error":"Autenticazione richiesta","message":"Devi effettuare il login..."}
```

**Test 2: Endpoint autenticato deve funzionare**

```bash
# 1. Fai login tramite UI
# 2. Prendi il session cookie dal browser (DevTools → Application → Cookies)
# 3. Testa con cookie:

curl -X POST https://your-app.vercel.app/api/compare \
  -H "Content-Type: application/json" \
  -H "Cookie: sb-xxx-auth-token=..." \
  -d '[{"peso":1,"provincia":"MI","contrassegno":"0"}]'

# Dovrebbe ritornare 200 con dati prezzi
```

### 3.2 Test Admin Authorization

**Test 1: Utente normale NON può modificare listini**

```bash
# Login con utente NON admin
# Prova a modificare listino:

curl -X PUT https://your-app.vercel.app/api/listini \
  -H "Content-Type: application/json" \
  -H "Cookie: [user-cookie]" \
  -d '{"id":"xxx","attivo":false}'

# Expected: 403 Forbidden
# {"error":"Accesso negato","message":"Solo gli amministratori..."}
```

**Test 2: Admin PUÒ modificare listini**

```bash
# Login con admin (uno degli email configurati in migration)
# Prova a modificare listino:

curl -X PUT https://your-app.vercel.app/api/listini \
  -H "Content-Type: application/json" \
  -H "Cookie: [admin-cookie]" \
  -d '{"id":"xxx","attivo":false}'

# Expected: 200 OK
# {"success":true,"data":{...}}
```

### 3.3 Test Input Validation

**Test 1: Input non valido deve essere respinto**

```bash
curl -X POST https://your-app.vercel.app/api/compare \
  -H "Content-Type: application/json" \
  -H "Cookie: [auth-cookie]" \
  -d '[{"peso":-1,"provincia":"INVALID"}]'

# Expected: 400 Bad Request
# {"error":"Dati non validi","details":{...}}
```

**Test 2: File non valido deve essere respinto**

```bash
# Prova a caricare un file .exe invece di CSV
# Expected: 400 Bad Request
# {"error":"Tipo file non supportato. Usa CSV o Excel."}
```

### 3.4 Test Webhook Signature

**Test 1: Webhook senza firma deve fallire**

```bash
curl -X POST https://your-app.vercel.app/api/webhooks/orders \
  -H "Content-Type: application/json" \
  -d '{"id":"test-order","total_price":100}'

# Expected: 401 Unauthorized
# {"error":"Missing webhook signature or timestamp"}
```

**Test 2: Webhook con firma corretta deve funzionare**

```javascript
// Script Node.js per generare firma valida:
const crypto = require('crypto');

const secret = 'YOUR_WEBHOOK_SECRET';
const timestamp = Date.now().toString();
const payload = JSON.stringify({id: "test-order", total_price: 100});
const body = `${timestamp}.${payload}`;

const signature = crypto
  .createHmac('sha256', secret)
  .update(body)
  .digest('hex');

console.log('Timestamp:', timestamp);
console.log('Signature:', signature);

// Usa questi valori per fare la richiesta:
// curl -X POST https://your-app.vercel.app/api/webhooks/orders \
//   -H "Content-Type: application/json" \
//   -H "x-webhook-signature: [signature]" \
//   -H "x-webhook-timestamp: [timestamp]" \
//   -d '{"id":"test-order","total_price":100}'
```

---

## 🚀 Step 4: Deploy in Production

### 4.1 Checklist Pre-Deployment

Prima di fare merge del branch, verifica:

- [ ] ✅ Migration SQL eseguita su Supabase
- [ ] ✅ Tutti gli admin hanno accesso (testato login)
- [ ] ✅ WEBHOOK_SECRET configurato in Vercel ENV
- [ ] ✅ Tests passano (autenticazione, validazione, admin)
- [ ] ✅ Build locale funziona (`npm run build`)
- [ ] ✅ No errori TypeScript (`npm run lint`)

### 4.2 Merge e Deploy

```bash
# 1. Merge del security branch
git checkout main  # o il tuo branch principale
git merge claude/security-audit-01WKcncRk5eGBBh5LcZYKaY2
git push origin main

# 2. Vercel farà auto-deploy
# Controlla deployment logs per errori

# 3. Dopo deploy, testa immediatamente:
# - Login funziona
# - OCR funziona (per utenti autenticati)
# - Admin può caricare listini
```

### 4.3 Post-Deployment Verification

**Checklist:**

1. **Login/Register Flow:**
   - [ ] Registrazione nuovo utente funziona
   - [ ] Email confirmation funziona
   - [ ] Login funziona
   - [ ] Redirect a /dashboard funziona

2. **API Endpoints:**
   - [ ] `/api/ocr` richiede autenticazione ✅
   - [ ] `/api/compare` richiede autenticazione ✅
   - [ ] `/api/listini` GET accessibile a tutti ✅
   - [ ] `/api/listini` PUT/DELETE solo admin ✅
   - [ ] `/api/csv` richiede autenticazione ✅
   - [ ] `/api/agent` richiede autenticazione ✅

3. **Security Headers:**
   - [ ] Verifica headers con: https://securityheaders.com
   - [ ] Score atteso: A o A+

4. **RLS Policies:**
   - [ ] Utente vede solo propri dati (se multi-tenant)
   - [ ] Admin può vedere tutti i dati
   - [ ] Non-admin non può modificare listini

---

## 🛡️ Step 5: Hardening Opzionale (Raccomandato)

### 5.1 Rate Limiting con Upstash (Opzionale ma Raccomandato)

Le API attualmente NON hanno rate limiting. Per aggiungerlo:

1. **Setup Upstash Redis:**
   ```bash
   # Vai su https://upstash.com/
   # Crea account gratuito
   # Crea database Redis
   # Copia UPSTASH_REDIS_REST_URL e UPSTASH_REDIS_REST_TOKEN
   ```

2. **Installa dipendenza:**
   ```bash
   npm install @upstash/ratelimit @upstash/redis
   ```

3. **Aggiungi ENV vars in Vercel:**
   ```
   UPSTASH_REDIS_REST_URL=https://...
   UPSTASH_REDIS_REST_TOKEN=...
   ```

4. **Implementa rate limiting:**
   Il codice helper è già preparato in `lib/auth-helpers.ts`, basta decommentare.

### 5.2 Monitoring e Alerting

**Opzione 1: Sentry (Error Tracking)**

```bash
npm install @sentry/nextjs
npx @sentry/wizard -i nextjs
```

**Opzione 2: Vercel Analytics (Performance)**

```bash
# Già incluso in Vercel
# Attiva da Dashboard → Analytics
```

**Opzione 3: Better Uptime (Uptime Monitoring)**

```
1. Vai su https://betteruptime.com
2. Crea monitor per https://your-app.vercel.app
3. Configura alert su email/Slack
```

### 5.3 Backup Automatici

Supabase fa backup automatici, ma verifica:

```bash
1. Supabase Dashboard → Settings → Database
2. Check che "Automatic Backups" sia enabled
3. Retention: almeno 7 giorni
```

---

## 📊 Step 6: Verifica Sicurezza

### 6.1 Security Scan Tools

**Tool 1: OWASP ZAP (Automated Scan)**

```bash
# Download: https://www.zaproxy.org/download/
# Run automated scan contro https://your-app.vercel.app
# Review risultati per vulnerabilità
```

**Tool 2: Security Headers Check**

```bash
# Visit: https://securityheaders.com
# Enter: https://your-app.vercel.app
# Expected score: A o A+
```

**Tool 3: npm audit**

```bash
cd spedire-sicuro-platform
npm audit

# Expected output:
# "found 0 vulnerabilities" oppure solo "low" severity
```

### 6.2 Penetration Testing Checklist

Testa manualmente:

- [ ] **Auth Bypass:** Non posso accedere a `/api/ocr` senza login
- [ ] **Authorization:** Utente normale non può modificare listini
- [ ] **SQL Injection:** Input `'; DROP TABLE spedizioni;--` è bloccato
- [ ] **XSS:** Input `<script>alert('xss')</script>` è sanitizzato
- [ ] **CSRF:** Richieste senza cookie falliscono
- [ ] **File Upload:** Non posso caricare `.exe` o `.sh`
- [ ] **Rate Limit:** (se implementato) Troppi tentativi sono bloccati
- [ ] **Prompt Injection:** AI non esegue `"Ignore previous instructions"`

---

## 🆘 Troubleshooting

### Problema 1: "Autenticazione richiesta" anche dopo login

**Causa:** Cookie non inviati o sessione scaduta

**Soluzione:**
```bash
1. Check browser DevTools → Application → Cookies
2. Verifica che ci sia `sb-xxx-auth-token`
3. Se manca, fai logout e re-login
4. Se persiste, verifica NEXT_PUBLIC_SUPABASE_URL in ENV
```

### Problema 2: Admin non può caricare listini

**Causa:** Migration SQL non eseguita o email non nel database

**Soluzione:**
```sql
-- Verifica se il tuo user è admin:
SELECT u.email, r.role
FROM auth.users u
LEFT JOIN user_roles r ON u.id = r.user_id
WHERE u.email = 'tuo-email@example.com';

-- Se non ha role 'admin', aggiungi manualmente:
INSERT INTO user_roles (user_id, role, created_by)
SELECT id, 'admin', id FROM auth.users
WHERE email = 'tuo-email@example.com';
```

### Problema 3: Webhook sempre ritorna 401

**Causa:** WEBHOOK_SECRET non configurato o firma errata

**Soluzione:**
```bash
# Verifica che WEBHOOK_SECRET sia in Vercel ENV
# Rigenera il secret:
openssl rand -hex 32

# Test senza signature (se vuoi disabilitare temporaneamente):
# Rimuovi WEBHOOK_SECRET da ENV → webhook accetterà richieste senza firma
# ⚠️ SOLO PER TEST, NON IN PRODUCTION
```

### Problema 4: CSP blocca risorse

**Causa:** Content Security Policy troppo restrittiva

**Soluzione:**
```javascript
// In next.config.js, aggiungi il dominio alla CSP:
"connect-src 'self' https://nuovo-dominio.com https://*.supabase.co"
```

### Problema 5: Build fallisce dopo merge

**Causa:** Possibili errori TypeScript

**Soluzione:**
```bash
# Rigenera types Supabase
npx supabase gen types typescript --project-id [PROJECT_ID] > lib/database.types.ts

# Fix lint errors
npm run lint -- --fix

# Rebuild
npm run build
```

---

## 📚 Risorse Aggiuntive

- **Security Audit Report:** `SECURITY_AUDIT_REPORT.md`
- **Migration SQL:** `supabase-security-migration.sql`
- **Validation Schemas:** `lib/validation-schemas.ts`
- **Auth Helpers:** `lib/auth-helpers.ts`
- **Error Handling:** `lib/error-handler.ts`

### Link Utili

- [Next.js Security Best Practices](https://nextjs.org/docs/app/building-your-application/deploying/production-checklist)
- [Supabase RLS Documentation](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [OWASP Top 10](https://owasp.org/Top10/)
- [Security Headers Guide](https://securityheaders.com/)

---

## ✅ Completamento

Dopo aver completato tutti gli step, dovresti avere:

- ✅ Applicazione sicura in production
- ✅ Tutti gli endpoint protetti da autenticazione
- ✅ Admin roles gestiti via database
- ✅ RLS policies implementate
- ✅ Input validation su tutti gli endpoint
- ✅ Security headers configurati
- ✅ Webhook signature verification attiva
- ✅ Zero vulnerabilità critiche o high

**Risk Score:** Da 8.5/10 → **2.0/10** (ACCETTABILE)

**Status:** ✅ **PRODUCTION READY**

---

**Domande?** Controlla il Security Audit Report o apri una issue su GitHub.

**Prossimi Step:** Considera implementazione rate limiting con Upstash per protezione DoS.
