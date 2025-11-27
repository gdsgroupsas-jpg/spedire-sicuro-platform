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
          <div className="flex-1 space-y-4 rounded-2xl border border-white/10 bg-white/5 p-6 shadow-2xl shadow-black/40">
            <p className="text-sm font-semibold text-emerald-300">Monitoraggio in tempo reale</p>
            <div className="grid gap-4 text-sm text-white/90">
              <div className="rounded-xl bg-black/50 p-4">
                <p className="text-xs text-slate-400">Volume giornaliero</p>
                <p className="text-3xl font-semibold">1.204 spedizioni</p>
                <p className="text-xs text-emerald-300">+18% rispetto alla media settimanale</p>
              </div>
              <div className="rounded-xl bg-black/50 p-4">
                <p className="text-xs text-slate-400">Margine medio per spedizione</p>
                <p className="text-3xl font-semibold">€4,32</p>
                <p className="text-xs text-slate-400">Ottimizzato con suggerimenti AI</p>
              </div>
              <div className="rounded-xl bg-black/50 p-4">
                <p className="text-xs text-slate-400">Tempo OCR medio</p>
                <p className="text-3xl font-semibold">11,2s</p>
                <p className="text-xs text-slate-400">Uso dedicato di Gemini 1.5 Flash</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <section className="mx-auto max-w-6xl space-y-10 px-6 py-16">
        <div className="space-y-4">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-400">Perché Spedire Sicuro</p>
          <h2 className="text-3xl font-bold text-white">Dal preventivo al recapito con un’unica regia.</h2>
          <p className="max-w-3xl text-base text-slate-300">
            La suite copre onboarding clienti, verifica listini, validazione CAP, controllo fatturazione e automazioni di follow-up.
            Ogni step è monitorato e corredato di audit log per audit e compliance.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {features.map((feature) => (
            <article key={feature.title} className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <h3 className="text-lg font-semibold text-white">{feature.title}</h3>
              <p className="mt-3 text-sm text-slate-300">{feature.description}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
