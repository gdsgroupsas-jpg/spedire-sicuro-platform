'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Package, 
  Truck, 
  BarChart3, 
  Camera, 
  Shield, 
  Zap,
  ArrowRight,
  CheckCircle2
} from 'lucide-react'

const features = [
  {
    icon: Camera,
    title: 'OCR Intelligente',
    description: 'Analizza screenshot di WhatsApp ed email per estrarre automaticamente i dati delle spedizioni.',
    color: 'bg-blue-50 text-blue-600'
  },
  {
    icon: Truck,
    title: 'Confronto Listini',
    description: 'Confronta i listini di tutti i corrieri e trova la tariffa migliore per ogni spedizione.',
    color: 'bg-green-50 text-green-600'
  },
  {
    icon: BarChart3,
    title: 'Report Avanzati',
    description: 'Monitora le performance, i margini e le statistiche delle tue spedizioni in tempo reale.',
    color: 'bg-purple-50 text-purple-600'
  },
  {
    icon: Shield,
    title: 'Sicurezza Totale',
    description: 'I tuoi dati sono protetti con crittografia avanzata e backup automatici.',
    color: 'bg-amber-50 text-amber-600'
  }
]

const benefits = [
  'Risparmia fino al 30% sulle spedizioni',
  'Riduci gli errori di inserimento dati',
  'Gestisci tutti i corrieri in un unico posto',
  'Report e statistiche in tempo reale',
  'Assistente AI per supporto 24/7',
  'Integrazione con i principali corrieri'
]

export default function MarketingHome() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Header/Navigation */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-yellow-500 shadow-sm">
              <Image 
                src="/logo.jpg" 
                alt="Spedire Sicuro" 
                fill
                className="object-cover"
                priority
              />
            </div>
            <span className="font-bold text-xl text-gray-900">Spedire Sicuro</span>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="#features" className="text-gray-600 hover:text-gray-900 transition-colors">
              Funzionalità
            </Link>
            <Link href="#benefits" className="text-gray-600 hover:text-gray-900 transition-colors">
              Vantaggi
            </Link>
            <Link href="/login" className="text-gray-600 hover:text-gray-900 transition-colors">
              Accedi
            </Link>
            <Link href="/register">
              <Button className="bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-semibold">
                Registrati Gratis
              </Button>
            </Link>
          </nav>
          {/* Mobile menu button */}
          <div className="md:hidden flex items-center gap-2">
            <Link href="/login">
              <Button variant="ghost" size="sm">Accedi</Button>
            </Link>
            <Link href="/register">
              <Button size="sm" className="bg-yellow-500 hover:bg-yellow-600 text-gray-900">
                Registrati
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-yellow-50 via-white to-green-50 -z-10" />
        <div className="container mx-auto px-4 py-20 md:py-32">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-yellow-100 text-yellow-800 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Zap className="w-4 h-4" />
              <span>Piattaforma Intelligente per la Logistica</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Gestisci le tue spedizioni in modo{' '}
              <span className="text-yellow-600">intelligente</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              La piattaforma all-in-one per la gestione delle spedizioni, confronto listini 
              e ottimizzazione logistica con intelligenza artificiale.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/register">
                <Button size="lg" className="bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-semibold text-lg">
                  Inizia Gratis
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline" className="text-lg">
                  Accedi al tuo account
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Tutto ciò che ti serve per spedire meglio
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Strumenti potenti e intelligenti per ottimizzare ogni aspetto delle tue spedizioni.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardHeader>
                  <div className={`w-12 h-12 rounded-lg ${feature.color} flex items-center justify-center mb-4`}>
                    <feature.icon className="w-6 h-6" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className="py-20 bg-secondary">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                Perché scegliere Spedire Sicuro?
              </h2>
              <p className="text-lg text-gray-300 mb-8">
                La nostra piattaforma ti aiuta a risparmiare tempo e denaro, 
                automatizzando i processi e fornendoti insights preziosi.
              </p>
              <ul className="space-y-4">
                {benefits.map((benefit, index) => (
                  <li key={index} className="flex items-center gap-3 text-white">
                    <CheckCircle2 className="w-5 h-5 text-yellow-400 flex-shrink-0" />
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-2xl p-8 border border-white/20">
              <div className="text-center">
                <Package className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-white mb-2">
                  Prova gratuita
                </h3>
                <p className="text-gray-300 mb-6">
                  Inizia oggi stesso senza costi nascosti. Nessuna carta di credito richiesta.
                </p>
                <Link href="/register">
                  <Button size="lg" className="w-full bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-semibold">
                    Crea il tuo account gratuito
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Pronto a ottimizzare le tue spedizioni?
          </h2>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Unisciti a centinaia di aziende che hanno già migliorato la loro logistica con Spedire Sicuro.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/register">
              <Button size="lg" className="bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-semibold">
                Inizia Ora
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline">
                Hai già un account? Accedi
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-yellow-500">
                  <Image 
                    src="/logo.jpg" 
                    alt="Spedire Sicuro" 
                    fill
                    className="object-cover"
                  />
                </div>
                <span className="font-bold text-xl text-white">Spedire Sicuro</span>
              </div>
              <p className="text-gray-400 max-w-md">
                Piattaforma intelligente per la gestione e l&apos;ottimizzazione delle spedizioni con AI.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Piattaforma</h4>
              <ul className="space-y-2">
                <li><Link href="/login" className="hover:text-white transition-colors">Accedi</Link></li>
                <li><Link href="/register" className="hover:text-white transition-colors">Registrati</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Contatti</h4>
              <ul className="space-y-2">
                <li>info@spediresicuro.it</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm">
            <p>&copy; {new Date().getFullYear()} Spedire Sicuro. Tutti i diritti riservati.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
