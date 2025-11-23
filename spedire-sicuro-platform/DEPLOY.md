# 🚀 Guida Deploy Rapida

## 📦 Hai 2 Opzioni

### OPZIONE A: Deploy Vercel (CONSIGLIATO - 5 minuti)

1. **Vai su Vercel**
   ```
   https://vercel.com/new
   ```

2. **Import da GitHub**
   - Click "Import Git Repository"
   - Seleziona: `gdsgroupsas-jpg/spedire-sicuro-platform`
   - Click "Import"

3. **Configura Environment Variables**
   ```
   NEXT_PUBLIC_SUPABASE_URL = https://mckroxzkwagtmtmvhvvq.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY = [chiedi a Salvatore]
   ANTHROPIC_API_KEY = your_anthropic_api_key_here
   ```

4. **Deploy**
   - Click "Deploy"
   - Aspetta 2 minuti
   - DONE! ✅

### OPZIONE B: Deploy Locale (Test)

1. **Scarica archivio**
   ```bash
   # Download spedire-sicuro-platform.tar.gz
   ```

2. **Estrai**
   ```bash
   tar -xzf spedire-sicuro-platform.tar.gz
   cd spedire-sicuro-platform
   ```

3. **Install**
   ```bash
   npm install
   ```

4. **Config**
   - Copia `.env.example` → `.env.local`
   - Inserisci le chiavi API

5. **Run**
   ```bash
   npm run dev
   ```

6. **Apri**
   ```
   http://localhost:3000/dashboard
   ```

## 🔑 Chiavi API Necessarie

### Supabase Anon Key

Vai su: https://supabase.com/dashboard/project/mckroxzkwagtmtmvhvvq/settings/api

Copia: `anon` public key

### Claude API Key

Inserisci la tua chiave Anthropic API

## ✅ Test Funzionamento

1. Vai su `/dashboard`
2. Upload screenshot ordine WhatsApp
3. AI legge dati automaticamente
4. Vedi comparazione prezzi
5. Download CSV ✅

## 🐛 Troubleshooting

**Errore "Invalid API Key"**
→ Controlla `.env.local` variabili

**Errore upload immagine**
→ Dimensione max 10MB, formato JPG/PNG

**CSV non si scarica**
→ Controlla console browser (F12)

## 📞 Support

Salvatore: striano@postaexpress.it
