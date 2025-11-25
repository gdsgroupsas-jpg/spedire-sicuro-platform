# Spedire Sicuro Platform

Piattaforma intelligente per la gestione e l'ottimizzazione delle spedizioni con AI.

## 🚀 Deploy Automatico su Vercel

### Come funziona

Ogni volta che si esegue un `git push` al branch `main`, viene automaticamente attivato un workflow GitHub Actions che:

1. Esegue il checkout del codice
2. Installa le dipendenze con `npm ci`
3. Esegue i linter
4. Compila il progetto con `npm run build`
5. Effettua il deploy automatico su Vercel con `npx vercel deploy --prod`

Il deployment è **sempre sincronizzato** con l'ultimo commit su `main` - nessun rischio di deploy accidentali di versioni obsolete.

### Configurazione richiesta (una sola volta)

Prima di eseguire il primo push, è necessario configurare 3 GitHub Secrets nel repository:

**Come accedere a GitHub Secrets:**
1. Vai a: `https://github.com/gdsgroupsas-jpg/spedire-sicuro-platform/settings/secrets/actions`
2. Clicca il pulsante "New repository secret"
3. Aggiungi i seguenti 3 secret:

#### 1️⃣ VERCEL_TOKEN
- **Valore:** Token di autenticazione personale di Vercel
- **Come ottenere:**
  1. Vai a https://vercel.com/account/tokens
  2. Clicca "Create"
  3. Dai un nome: "GitHub Actions"
  4. Copia il token intero
  5. Incollalo su GitHub come `VERCEL_TOKEN`

#### 2️⃣ VERCEL_ORG_ID
- **Valore:** ID dell'organizzazione Vercel
- **Come ottenere:**
  1. Vai a https://vercel.com/account/settings
  2. Scorri fino a "Team ID"
  3. Copia il valore
  4. Incollalo su GitHub come `VERCEL_ORG_ID`

#### 3️⃣ VERCEL_PROJECT_ID
- **Valore:** ID del progetto su Vercel
- **Come ottenere:**
  1. Vai al dashboard Vercel: https://vercel.com/gdsgroupsas-6132s-projects/spedire-sicuro-platform
  2. Clicca "Settings"
  3. Scorri fino a "Project ID"
  4. Copia il valore
  5. Incollalo su GitHub come `VERCEL_PROJECT_ID`

### Verificare che tutto funzioni

Dopo la configurazione dei secret:

**Passo 1: Monitorare GitHub Actions**
- Vai a: https://github.com/gdsgroupsas-jpg/spedire-sicuro-platform/actions
- Dovresti vedere un workflow "Deploy to Vercel Production" in esecuzione
- Aspetta che termini (solitamente 2-3 minuti)
- Il workflow deve mostrare lo stato "completed successfully" (pallino verde)

**Passo 2: Verificare il deployment su Vercel**
- Vai a: https://vercel.com/gdsgroupsas-6132s-projects/spedire-sicuro-platform/deployments
- Cerca il deployment più recente corrispondente al commit appena fatto
- Lo stato deve essere "Ready"
- Clicca sul deployment per vedere l'URL di preview

**Passo 3: Testare il sito live**
- Vai all'URL di produzione: https://spedire-sicuro.vercel.app
- Verifica che sia accessibile e funzioni correttamente
- Testa le funzionalità principali

### File di configurazione

- **`.github/workflows/vercel-production-deploy.yml`** - Workflow GitHub Actions che gestisce il deploy
- **`vercel.json`** - Configurazione Vercel con comandi di build e deploy
- **`.env.example`** - Template delle variabili d'ambiente (da copiare a `.env.local`)

### Troubleshooting

**Il workflow fallisce durante il build:**
- Controlla che `npm run build` funzioni localmente: `npm run build`
- Verifica che tutte le variabili d'ambiente siano configurate
- Guarda i log del workflow su GitHub Actions per i dettagli dell'errore

**Il deploy su Vercel non parte:**
- Verifica che i 3 secret (VERCEL_TOKEN, VERCEL_ORG_ID, VERCEL_PROJECT_ID) siano configurati correttamente
- Vai a Settings → Secrets → Actions per controllare
- I secret non vengono mai mostrati a schermo - se non li vedi è normale

**La build è lenta:**
- La prima build dopo il setup potrebbe impiegare più tempo
- Vercel cache i risultati per le build successive
- Solitamente: prima build 3-5 minuti, build successive 1-2 minuti

## Stack Tecnologico

- **Frontend:** Next.js 14 (React)
- **Backend:** Next.js API Routes
- **Database:** Supabase (PostgreSQL)
- **AI:** Google Gemini Vision API
- **Hosting:** Vercel
- **CI/CD:** GitHub Actions

## Variabili d'ambiente

Copla `.env.example` in `.env.local` e configura:

```bash
NEXT_PUBLIC_SUPABASE_URL=<your_supabase_url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your_supabase_key>
GOOGLE_GEMINI_API_KEY=<your_gemini_key>
```

## Comandi locali

```bash
# Installa dipendenze
npm install

# Avvia dev server
npm run dev

# Build di produzione
npm run build

# Lint
npm run lint

# Export statico
npm run export
```

## Licenza

MIT
