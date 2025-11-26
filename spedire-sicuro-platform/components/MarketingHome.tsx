'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Package, 
  Camera, 
  Truck, 
  BarChart3, 
  Shield, 
  Clock, 
  ArrowRight,
  Star,
  CheckCircle2,
  Zap
} from 'lucide-react'

const features = [
  {
    icon: Camera,
    title: 'OCR Intelligente',
    description: 'Carica screenshot di email o WhatsApp e il sistema estrae automaticamente tutti i dati della spedizione.',
    color: 'bg-blue-50 text-blue-600'
  },
  {
    icon: BarChart3,
    title: 'Confronto Listini',
    description: 'Carica i listini dei corrieri e confronta automaticamente i prezzi per ogni spedizione.',
    color: 'bg-green-50 text-green-600'
  },
  {
    icon: Truck,
    title: 'Gestione Spedizioni',
    description: 'Gestisci tutte le tue spedizioni da un\'unica dashboard, con tracking e reportistica.',
    color: 'bg-purple-50 text-purple-600'
  },
  {
    icon: Shield,
    title: 'Sicurezza Garantita',
    description: 'I tuoi dati sono protetti con crittografia end-to-end e backup automatici.',
    color: 'bg-amber-50 text-amber-600'
  }
]

const benefits = [
  'Risparmia tempo con l\'estrazione automatica dei dati',
  'Riduci gli errori manuali di inserimento',
  'Confronta i prezzi in tempo reale',
  'Ottimizza i margini su ogni spedizione',
  'Report dettagliati delle performance'
]

export default function MarketingHome() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-500 via-yellow-600 to-green-700">
      {/* Navigation */}
      <nav className="container mx-auto px-4 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-white/30 shadow-lg">
            <Image 
              src="/logo.jpg" 
              alt="Spedire Sicuro" 
              fill
              className="object-cover"
              priority
            />
          </div>
          <span className="text-white font-bold text-xl">Spedire Sicuro</span>
        </div>
        <div className="flex gap-4">
          <Link href="/login">
            <Button variant="ghost" className="text-white hover:bg-white/20">
              Accedi
            </Button>
          </Link>
          <Link href="/register">
            <Button className="bg-white text-yellow-700 hover:bg-yellow-50 font-semibold">
              Registrati
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
              Gestisci le tue spedizioni con l'intelligenza artificiale
            </h1>
            <p className="text-xl md:text-2xl text-white/90 mb-8 leading-relaxed">
              Piattaforma all-in-one per la gestione logistica: OCR automatico, 
              confronto listini e ottimizzazione dei costi.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link href="/register">
              <Button size="lg" className="bg-white text-yellow-700 hover:bg-yellow-50 font-bold text-lg px-8 py-6 gap-2">
                Inizia Gratis
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/20 font-semibold text-lg px-8 py-6">
                Accedi ora
              </Button>
            </Link>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="grid grid-cols-3 gap-6 mt-16 max-w-2xl mx-auto"
          >
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-white">500+</div>
              <div className="text-white/80 text-sm">Spedizioni gestite</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-white">30%</div>
              <div className="text-white/80 text-sm">Risparmio medio</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-white">12s</div>
              <div className="text-white/80 text-sm">Tempo medio OCR</div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Tutto quello che ti serve, in un'unica piattaforma
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Strumenti avanzati per automatizzare e ottimizzare ogni aspetto delle tue spedizioni.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="h-full hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className={`w-12 h-12 rounded-lg ${feature.color} flex items-center justify-center mb-4`}>
                      <feature.icon className="h-6 w-6" />
                    </div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="bg-gray-50 py-20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Perché scegliere Spedire Sicuro?
              </h2>
              <p className="text-gray-600 text-lg mb-8">
                La nostra piattaforma ti aiuta a risparmiare tempo e denaro su ogni spedizione, 
                automatizzando i processi più noiosi e fornendoti insights preziosi.
              </p>
              <ul className="space-y-4">
                {benefits.map((benefit, index) => (
                  <motion.li
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="flex items-center gap-3"
                  >
                    <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                    <span className="text-gray-700">{benefit}</span>
                  </motion.li>
                ))}
              </ul>
            </div>
            <div className="relative">
              <div className="bg-gradient-to-br from-yellow-500 to-green-600 rounded-2xl p-8 shadow-2xl">
                <div className="bg-white rounded-xl p-6 space-y-4">
                  <div className="flex items-center gap-3">
                    <Zap className="h-6 w-6 text-yellow-600" />
                    <span className="font-semibold text-gray-900">Analisi in tempo reale</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-green-500 rounded-full"
                      initial={{ width: 0 }}
                      whileInView={{ width: '85%' }}
                      transition={{ duration: 1, delay: 0.3 }}
                      viewport={{ once: true }}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4 pt-4">
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <Package className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                      <div className="font-bold text-2xl text-gray-900">127</div>
                      <div className="text-sm text-gray-600">Spedizioni</div>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <Star className="h-6 w-6 mx-auto mb-2 text-amber-500" />
                      <div className="font-bold text-2xl text-gray-900">€489</div>
                      <div className="text-sm text-gray-600">Risparmiati</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-yellow-600 to-green-600 py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Pronto a ottimizzare le tue spedizioni?
          </h2>
          <p className="text-white/90 text-lg mb-8 max-w-2xl mx-auto">
            Registrati oggi e inizia a risparmiare tempo e denaro su ogni spedizione.
          </p>
          <Link href="/register">
            <Button size="lg" className="bg-white text-yellow-700 hover:bg-yellow-50 font-bold text-lg px-8 py-6 gap-2">
              Inizia Gratis Ora
              <ArrowRight className="h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-gray-700">
                <Image 
                  src="/logo.jpg" 
                  alt="Spedire Sicuro" 
                  fill
                  className="object-cover"
                />
              </div>
              <span className="text-white font-semibold">Spedire Sicuro Platform</span>
            </div>
            <div className="text-gray-400 text-sm">
              © {new Date().getFullYear()} Spedire Sicuro. Tutti i diritti riservati.
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
