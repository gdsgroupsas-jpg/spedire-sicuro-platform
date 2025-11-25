// Deployment trigger for commit 864bac9

import { createServerClient } from '@supabase/ssr';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, CheckCircle2, Zap, BarChart3, ShieldCheck, Box, Truck, FileText, Smartphone } from "lucide-react";

function MarketingHome() {
    return (
        <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-amber-100 selection:text-amber-900">
      
      {/* Navigation */}
      <nav className="sticky top-0 z-40 w-full border-b bg-white/80 backdrop-blur-md">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-8">
          <div className="flex items-center gap-2 font-bold text-xl tracking-tight">
            <Box className="h-6 w-6 text-amber-500" />
            <span>SPEDIRE<span className="text-amber-600">SICURO</span></span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
            <Link href="#features" className="hover:text-amber-600 transition-colors">Funzionalità</Link>
            <Link href="#how-it-works" className="hover:text-amber-600 transition-colors">Come Funziona</Link>
            <Link href="#pricing" className="hover:text-amber-600 transition-colors">Prezzi</Link>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost" className="text-slate-600 hover:text-amber-600 hover:bg-amber-50">Accedi</Button>
            </Link>
            <Link href="/register">
              <Button className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white shadow-lg shadow-amber-500/20 rounded-full px-6">
                Inizia Gratis
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-32 lg:pt-32 lg:pb-40">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-amber-200/20 rounded-full blur-3xl -z-10" />
        <div className="container mx-auto px-4 md:px-8 flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
          <div className="flex-1 text-center lg:text-left space-y-8 animate-in slide-in-from-bottom-8 duration-700">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-xs font-semibold uppercase tracking-wide">
              <Zap className="h-3 w-3 fill-amber-500" />
              Nuovo Neural Core v2.0
            </div>
            <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight text-slate-900 leading-[1.1]">
              Logistica <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-600">Intelligente</span>
            </h1>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
              Trasforma screenshot e documenti in spedizioni pronte in un click. 
              Il primo software gestionale che usa l'AI per ottimizzare prezzi, tracking e profitti.
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
              <Link href="/register" className="w-full sm:w-auto">
                <Button size="lg" className="w-full h-14 text-lg bg-slate-900 hover:bg-slate-800 text-white rounded-full px-8 shadow-xl">
                  Provalo Ora <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="#demo" className="w-full sm:w-auto">
                <Button variant="outline" size="lg" className="w-full h-14 text-lg border-slate-200 hover:bg-slate-50 rounded-full px-8">
                  Vedi Demo
                </Button>
              </Link>
            </div>
            <div className="flex items-center justify-center lg:justify-start gap-6 text-sm text-slate-500 pt-4">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" /> Nessuna carta richiesta
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" /> Setup in 2 minuti
              </div>
            </div>
          </div>

          {/* Hero Visual / Mockup */}
          <div className="flex-1 w-full relative animate-in fade-in zoom-in duration-1000 delay-200">
            <div className="relative z-10 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden transform rotate-1 hover:rotate-0 transition-transform duration-500">
              <div className="bg-slate-50 border-b p-4 flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-yellow-400" />
                  <div className="w-3 h-3 rounded-full bg-green-400" />
                </div>
                <div className="mx-auto text-xs font-medium text-slate-400 bg-white px-3 py-1 rounded-md shadow-sm">
                  dashboard.spediresicuro.com
                </div>
              </div>
              <div className="p-6 grid gap-6">
                {/* Mockup Content */}
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-bold text-xl">Spedizioni Recenti</h3>
                    <p className="text-sm text-slate-500">Ultimo aggiornamento: Oggi, 14:30</p>
                  </div>
                  <Button size="sm" className="bg-amber-500 text-white">Nuova Spedizione</Button>
                </div>
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center p-3 bg-slate-50 rounded-lg border border-slate-100">
                      <div className="h-10 w-10 rounded-full bg-white flex items-center justify-center shadow-sm text-lg">📦</div>
                      <div className="ml-3 flex-1">
                        <div className="h-4 w-32 bg-slate-200 rounded mb-2" />
                        <div className="h-3 w-20 bg-slate-100 rounded" />
                      </div>
                      <div className="text-right">
                         <div className="h-4 w-16 bg-green-100 text-green-700 rounded text-xs flex items-center justify-center font-bold">COMPLETATO</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            {/* Decorazioni sfondo */}
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full blur-2xl opacity-30" />
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-blue-400 rounded-full blur-3xl opacity-20" />
          </div>
        </div>
      </section>

      {/* Logos Section */}
      <section className="border-y bg-slate-50/50 py-12">
        <div className="container mx-auto px-4">
          <p className="text-center text-sm font-semibold text-slate-400 uppercase tracking-wider mb-8">
            Integrato con i migliori corrieri e piattaforme
          </p>
          <div className="flex flex-wrap justify-center items-center gap-12 grayscale opacity-60 hover:opacity-100 hover:grayscale-0 transition-all duration-500">
            {/* Placeholder Logos with text for now */}
            {["DHL", "UPS", "FedEx", "GLS", "BRT", "Poste Italiane", "Shopify", "WooCommerce"].map((logo) => (
              <span key={logo} className="text-xl font-bold text-slate-600">{logo}</span>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 lg:py-32">
        <div className="container mx-auto px-4 md:px-8">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-3xl lg:text-5xl font-bold text-slate-900 mb-6">Tutto quello che ti serve per spedire meglio.</h2>
            <p className="text-lg text-slate-600">
              Abbiamo condensato 10 anni di esperienza logistica in una piattaforma singola, 
              potenziata dall'Intelligenza Artificiale più avanzata.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-slate-100 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center mb-4">
                  <Smartphone className="h-6 w-6 text-amber-600" />
                </div>
                <CardTitle>OCR WhatsApp Scanner</CardTitle>
              </CardHeader>
              <CardContent className="text-slate-600">
                Fai uno screenshot dell'ordine su WhatsApp o email. La nostra AI estrae indirizzo, prodotti e telefono in 0.5 secondi.
              </CardContent>
            </Card>

            <Card className="border-slate-100 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                  <BarChart3 className="h-6 w-6 text-blue-600" />
                </div>
                <CardTitle>Comparatore Prezzi Dinamico</CardTitle>
              </CardHeader>
              <CardContent className="text-slate-600">
                Carica i tuoi listini CSV. Il sistema calcola automaticamente il corriere più economico per ogni specifica zona e fascia di peso.
              </CardContent>
            </Card>

            <Card className="border-slate-100 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4">
                  <ShieldCheck className="h-6 w-6 text-green-600" />
                </div>
                <CardTitle>Contabilità & Profitto</CardTitle>
              </CardHeader>
              <CardContent className="text-slate-600">
                Visualizza il margine netto su ogni singola spedizione prima di partire. Tieni traccia del fondo cassa e dei costi occulti.
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Neural Core Highlight */}
      <section className="py-24 bg-slate-900 text-white overflow-hidden relative">
        <div className="container mx-auto px-4 md:px-8 relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="flex-1 space-y-8">
              <h2 className="text-3xl lg:text-5xl font-bold">
                Incontra il tuo nuovo <br />
                <span className="text-amber-500">Responsabile Logistico AI</span>
              </h2>
              <p className="text-slate-300 text-lg leading-relaxed">
                Non è solo un chatbot. È un agente neurale integrato che conosce i tuoi listini, 
                le tue spedizioni e i problemi comuni. Ti suggerisce come risparmiare, 
                risolve errori di indirizzi e monitora le anomalie 24/7.
              </p>
              <ul className="space-y-4">
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-amber-500" />
                  <span>Analisi predittiva dei ritardi</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-amber-500" />
                  <span>Correzione automatica CAP e Località</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-amber-500" />
                  <span>Assistente sempre disponibile in chat</span>
                </li>
              </ul>
            </div>
            <div className="flex-1 relative">
              {/* Abstract Visualization of AI */}
              <div className="relative w-full aspect-square max-w-md mx-auto bg-gradient-to-tr from-amber-500/20 to-blue-500/20 rounded-full border border-white/10 backdrop-blur-3xl flex items-center justify-center">
                <div className="absolute inset-0 rounded-full bg-slate-950/50" />
                <div className="relative z-10 text-center p-8">
                   <div className="w-20 h-20 mx-auto bg-amber-500 rounded-2xl flex items-center justify-center mb-6 shadow-[0_0_40px_rgba(245,158,11,0.5)]">
                      <Zap className="h-10 w-10 text-white" />
                   </div>
                   <div className="bg-slate-800/80 backdrop-blur rounded-xl p-4 text-left border border-slate-700 shadow-2xl max-w-xs mx-auto transform translate-y-4">
                      <p className="text-xs text-slate-400 mb-1">Logistic AI dice:</p>
                      <p className="text-sm text-slate-200">"Ho notato che spedisci spesso a Milano con BRT. Se passi a GLS risparmi il 15% su questa fascia di peso. Vuoi procedere?"</p>
                   </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Background Grid */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-soft-light"></div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="container mx-auto px-4 md:px-8">
          <div className="bg-gradient-to-r from-amber-500 to-orange-600 rounded-3xl p-12 md:p-24 text-center text-white relative overflow-hidden">
            <div className="relative z-10 max-w-3xl mx-auto space-y-8">
              <h2 className="text-4xl md:text-5xl font-bold">Pronto a scalare il tuo business?</h2>
              <p className="text-xl text-amber-100">
                Unisciti a centinaia di aziende che spediscono in modo più intelligente, veloce e sicuro.
              </p>
              <Link href="/register" className="inline-block">
                <Button size="lg" className="h-16 px-10 text-lg bg-white text-orange-600 hover:bg-slate-100 border-none shadow-2xl rounded-full font-bold">
                  Crea Account Gratuito
                </Button>
              </Link>
              <p className="text-sm text-amber-100 opacity-80">Nessun impegno richiesto. Prova gratuita inclusa.</p>
            </div>
            
            {/* Background circles */}
            <div className="absolute top-0 left-0 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-orange-800 opacity-20 rounded-full blur-3xl translate-x-1/3 translate-y-1/3" />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-50 border-t py-16 text-slate-600">
        <div className="container mx-auto px-4 md:px-8 grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="space-y-4">
            <div className="flex items-center gap-2 font-bold text-xl text-slate-900">
              <Box className="h-6 w-6 text-amber-500" />
              <span>SPEDIRE<span className="text-amber-600">SICURO</span></span>
            </div>
            <p className="text-sm leading-relaxed">
              La piattaforma definitiva per la logistica moderna. Semplifichiamo le spedizioni per e-commerce e aziende.
            </p>
          </div>
          <div>
            <h4 className="font-bold text-slate-900 mb-4">Prodotto</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="#" className="hover:text-amber-600">Funzionalità</Link></li>
              <li><Link href="#" className="hover:text-amber-600">Prezzi</Link></li>
              <li><Link href="#" className="hover:text-amber-600">API per Sviluppatori</Link></li>
              <li><Link href="#" className="hover:text-amber-600">Integrazioni</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-slate-900 mb-4">Risorse</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="#" className="hover:text-amber-600">Documentazione</Link></li>
              <li><Link href="#" className="hover:text-amber-600">Guida Rapida</Link></li>
              <li><Link href="#" className="hover:text-amber-600">Blog</Link></li>
              <li><Link href="#" className="hover:text-amber-600">Supporto</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-slate-900 mb-4">Legale</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="#" className="hover:text-amber-600">Privacy Policy</Link></li>
              <li><Link href="#" className="hover:text-amber-600">Termini di Servizio</Link></li>
              <li><Link href="#" className="hover:text-amber-600">Cookie Policy</Link></li>
            </ul>
          </div>
        </div>
        <div className="container mx-auto px-4 md:px-8 mt-12 pt-8 border-t text-center text-sm text-slate-400">
          © {new Date().getFullYear()} GDS Group S.A.S. Tutti i diritti riservati.
        </div>
      </footer>
    </div>
    );
}

// Questo è il Server Component che gestisce la logica di routing.
export default async function Index() {
    const cookieStore = cookies();
    
    // Inizializza il client Supabase lato Server per il check Auth
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
    
    // Controlla lo stato della sessione
    const { data: { session } } = await supabase.auth.getSession();
    
    // Logica Cruciale:
    if (session) {
        // Se l'utente è loggato, bypassa la homepage e reindirizza alla Dashboard.
        // Lo status code HTTP 302 (temporaneo) è ideale.
        redirect('/dashboard');
    }

    // Se l'utente NON è loggato, renderizza la Homepage (Login/Marketing)
    return <MarketingHome />;
}
// Force update
