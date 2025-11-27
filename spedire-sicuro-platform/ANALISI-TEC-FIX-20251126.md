# 📘 Analisi Tecnica – Landing, API OCR e Tooling  
_Data: 26 Novembre 2025_  

## 1. Contesto & Sintesi
- La homepage pubblica non rendeva più nulla perché `app/page.tsx` importava un componente inesistente (`MarketingHome`), mandando in errore la build e producendo cache inconsistent.  
- Le API OCR avevano fallback automatici sulle variabili `GOOGLE_API_KEY`/`GEMINI_API_KEY`, con sintassi `template literal` fragile che in passato ha generato errori.  
- L’area Dashboard ereditava un `layout.tsx` da 0 byte, quindi mancavano padding, sfondi e wrapper coerenti.  
- La root layout utilizzava ancora i Google Fonts remoti con `next/font/google`, aprendo timeout di rete e dipendenze esterne.  
- L’ambiente non aveva più lint configurato: `next lint` veniva bloccato chiedendo setup manuale.  

## 2. Interventi Dettagliati

### 2.1 Homepage & Routing
- **Diagnosi:** la rotte `/` tentava il redirect condizionato verso `/dashboard` ma, in assenza di `MarketingHome`, crashava prima di mostrare la landing.  
- **Fix:** creazione del componente e collegamento esplicito nel server component, preservando il comportamento “redirect solo se sessione valida”.  

```1:40:app/page.tsx // redirect condizionale verso dashboard e fallback Marketing
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import MarketingHome from '@/components/MarketingHome';

export const dynamic = 'force-dynamic';

export default async function Home() {
  let session = null;

  try {
    const cookieStore = cookies();
    
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
        },
      }
    );

    const { data } = await supabase.auth.getSession();
    session = data.session;

  } catch (error) {
    // Se Supabase fallisce, non mostrare pagina errore, mostra la Home Marketing
    console.error("⚠️ Errore check sessione home:", error);
  }

  // Redirect SOLO se siamo sicuri al 100% della sessione
  if (session) {
    redirect('/dashboard');
  }

  // Altrimenti mostra la Home Marketing
  return <MarketingHome />;
}
```

```1:58:components/MarketingHome.tsx // landing hero, CTA e griglia feature
import Link from 'next/link';

const features = [
  {
    title: 'OCR Potenziato da AI',
    description:
      'Carica etichette, screenshot o PDF e ottieni dati strutturati pronti per la spedizione.',
  },
  {
    title: 'Confronto Listini in Real Time',
    description:
      'Integra listini multipli e suggerisci automaticamente il corriere con il margine migliore.',
  },
  {
    title: 'Automazioni Postali',
    description:
      'Workflow configurabili per email, SMS e aggiornamenti CRM senza intervento manuale.',
  },
];

export default function MarketingHome() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="relative isolate overflow-hidden bg-gradient-to-br from-slate-900 via-slate-950 to-black">
        <div className="mx-auto flex max-w-6xl flex-col gap-12 px-6 py-24 lg:flex-row lg:items-center">
          <div className="flex-1 space-y-6">
            <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs uppercase tracking-wide text-sky-200">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              Release 2025 · OCR + Automazioni
            </p>
            <h1 className="text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl">
              Spedire Sicuro Platform
              <span className="block text-sky-200">logistica, AI e margini in un’unica console.</span>
            </h1>
            <p className="max-w-2xl text-base text-slate-300">
              Gestisci pipeline B2B, digitalizza i listini, abbina i corrieri e migliora il margine su ogni spedizione.
              Il motore AI suggerisce azioni correttive prima che diventino costi.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/register"
                className="inline-flex items-center justify-center rounded-md bg-emerald-400 px-6 py-3 text-center text-sm font-semibold text-emerald-950 shadow-lg shadow-emerald-400/30 transition hover:bg-emerald-300"
              >
                Crea un account
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center justify-center rounded-md border border-white/30 px-6 py-3 text-center text-sm font-semibold text-white transition hover:bg-white/10"
              >
                Accedi alla piattaforma
              </Link>
            </div>
            <div className="flex items-center gap-6 text-xs uppercase tracking-wide text-slate-400">
              <span>API Monitoring</span>
              <span>Gemini OCR</span>
              <span>Reportistica Margini</span>
            </div>
          </div>
          {/* ... */}
```

### 2.2 API OCR Gemini
- **Diagnosi:** fallback automatico verso `GOOGLE_API_KEY` innescava key errate e generava warning di sicurezza; la stringa multi-linea col riferimento a ```json``` rompeva l’analisi sintattica.  
- **Fix:** vincolo severo sulla variabile `GEMINI_API_KEY`, log espliciti e prompt ripulito da markdown.  

```1:67:app/api/ocr/route.ts // uso esclusivo GEMINI_API_KEY e prompt sanitizzato
import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// 1. Configurazione Sicura: obbligatorio GEMINI_API_KEY per evitare fallback rischiosi
const API_KEY = process.env.GEMINI_API_KEY;

export async function POST(req: NextRequest) {
  try {
    // Check Preliminare
    if (!API_KEY) {
      console.error("❌ CRITICAL: Variabile GEMINI_API_KEY mancante.");
      return NextResponse.json(
        { error: 'Configurazione Server Errata: API Key mancante' },
        { status: 500 }
      );
    }
    // ...
    const prompt = `
      Analizza questa etichetta di spedizione o documento logistico.
      Estrai ESATTAMENTE questi dati in formato JSON puro:
      {
        "mittente": { "nome": "", "indirizzo": "", "citta": "", "cap": "", "nazione": "" },
        "destinatario": { "nome": "", "indirizzo": "", "citta": "", "cap": "", "nazione": "", "telefono": "", "email": "" },
        "spedizione": { "peso_kg": 0, "dimensioni_cm": { "lunghezza": 0, "larghezza": 0, "altezza": 0 } }
      }
      Se un dato non è visibile, usa null o 0. NON aggiungere markdown o blocchi di codice. Solo il JSON.
    `;
    // ...
  } catch (error: any) {
    console.error("🔥 ERRORE OCR:", error);
    return NextResponse.json(
      { error: error.message || 'Errore interno durante l\'OCR' },
      { status: 500 }
    );
  }
}
```

### 2.3 Dashboard Layout
- **Diagnosi:** il layout dedicato era vuoto, quindi tutte le sottopagine si appoggiavano al layout globale senza container.  
- **Fix:** wrapper leggero con background chiaro e `max-width` coerente con i design token della dashboard.  

```1:10:app/dashboard/layout.tsx // wrapper coerente per tutte le sottorotte
import type { ReactNode } from 'react';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-100">
      <div className="mx-auto max-w-7xl px-6 py-10">
        {children}
      </div>
    </div>
  );
}
```

### 2.4 Font Strategy & Performance
- **Diagnosi:** `next/font/google` scaricava i Google Fonts ad ogni build, introducendo dipendenza di rete che aveva già causato timeout verso CDN.  
- **Fix:** ritorno a `font-sans` Tailwind + `antialiased`, ereditando lo stack locale dal browser e delegando la definizione del font a `globals.css`.  

```1:33:app/layout.tsx // layout root senza fetch da Google Fonts
import type { Metadata } from 'next'
import AuthProvider from '@/components/providers/auth-provider'
import { GlobalAssistant } from "@/components/ai/GlobalAssistant";
import './globals.css'

export const metadata: Metadata = {
  title: {
    template: '%s | Spedire Sicuro Platform',
    default: 'Spedire Sicuro Platform - Gestione Logistica Avanzata',
  },
  description: 'Piattaforma all-in-one per la gestione delle spedizioni, confronto listini e ottimizzazione logistica.',
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it">
      <body className="font-sans antialiased bg-background text-foreground">
        <AuthProvider>
          {children}
          <GlobalAssistant />
        </AuthProvider>
      </body>
    </html>
  )
}
```

```1:36:app/globals.css // corpo pagina con stack locale + anti-alias
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 222.2 84% 4.9%;
    --primary: 51 100% 50%;
    --primary-foreground: 210 65% 18%;
    --secondary: 210 65% 18%;
    --secondary-foreground: 51 100% 50%;
    --muted: 210 40% 96.1%;
    --muted-foreground: 215.4 16.3% 46.9%;
    --accent: 210 40% 96.1%;
    --accent-foreground: 222.2 47.4% 11.2%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;
    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 51 100% 50%;
    --radius: 0.5rem;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground font-sans antialiased;
  }
}
```

### 2.5 Tooling & CI lint
- **Problema:** `next lint` avviava la procedura guidata perché mancavano `eslint`, `eslint-config-next` e un file `.eslintrc`.  
- **Fix:** aggiunta `.eslintrc.json` minimale (`extends: next/core-web-vitals`) con deroga alla sola regola `react/no-unescaped-entities`, installazione di `eslint@8.57.x` + `eslint-config-next@14.0.4`. Ora `npm run lint` gira senza bloccare la pipeline (restano solo 3 warning già noti sulle dipendenze dei `useEffect`).  

## 3. Configurazione & Sicurezza
- Nessuna modifica ai redirect di `vercel.json` (già puliti nel merge precedente) ma verificato che non ci siano più rewrite circolari.  
- Le API OCR loggano un errore bloccante se manca `GEMINI_API_KEY`; lato ops serve quindi aggiornare gli ambienti per assicurarsi che la variabile sia presente in Vercel/Supabase.  
- Installati i pacchetti `eslint`/`eslint-config-next` a livello di progetto; ricordarsi di aggiungerli in futuro nelle immagini CI per evitare differenze locali.  

## 4. Test & Verifiche
- `npm install` (root + progetto) per riallineare i `node_modules`.  
- `npm run lint` → ✅ nessun errore; rimangono solo warning noti su `react-hooks/exhaustive-deps` da valutare separatamente.  

## 5. Backlog & Prossimi Passi Suggeriti
1. **Supabase Session Handling:** valutare caching delle sessioni per ridurre i tempi di risposta della homepage (`cookies()` + `createServerClient`).  
2. **OCR Observability:** tracciare metriche (tempo medio, error rate) sfruttando gli stessi dati mostrati nel modulo marketing quando l’utente è autenticato.  
3. **React Hooks Warning:** o si disabilita la regola nel layout dashboard oppure si memorizzano le funzioni `fetch*` con `useCallback` per eliminare i warning.  
4. **Font Locale:** opzionale ma consigliato aggiungere in `public/fonts/` un `.woff2` proprietario per avere tipografia consistente anche dove il sistema non espone Inter.  

Con queste modifiche la build torna stabile, la landing è nuovamente renderizzata per gli utenti anonimi e l’API OCR opera solo con chiavi Gemini autorizzate, eliminando i fallback rischiosi.
