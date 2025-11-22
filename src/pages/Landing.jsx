import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Shield,
  Zap,
  Users,
  CheckCircle,
  ArrowRight,
  Package,
  FileCheck,
  Clock,
  Lock,
  BarChart3,
  Globe,
  Star
} from 'lucide-react'

function Landing() {
  const features = [
    {
      icon: Shield,
      title: 'Sicurezza Totale',
      description: 'Crittografia end-to-end per tutti i tuoi documenti sensibili di spedizione.'
    },
    {
      icon: Zap,
      title: 'Velocità Estrema',
      description: 'Upload e revisione in tempo reale. Nessuna attesa, massima efficienza.'
    },
    {
      icon: Users,
      title: 'Collaborazione',
      description: 'Team di revisori dedicati per approvazioni rapide e tracciabili.'
    },
    {
      icon: BarChart3,
      title: 'Analytics Avanzate',
      description: 'Dashboard completa per monitorare ogni aspetto delle tue spedizioni.'
    }
  ]

  const stats = [
    { value: '99.9%', label: 'Uptime Garantito' },
    { value: '< 2h', label: 'Tempo Medio Revisione' },
    { value: '50K+', label: 'Documenti Gestiti' },
    { value: '500+', label: 'Aziende Clienti' }
  ]

  const steps = [
    {
      icon: Package,
      title: 'Carica',
      description: 'Carica i tuoi documenti in modo sicuro con un semplice drag & drop.'
    },
    {
      icon: FileCheck,
      title: 'Revisione',
      description: 'I nostri revisori verificano accuratamente ogni documento.'
    },
    {
      icon: CheckCircle,
      title: 'Approvazione',
      description: 'Ricevi notifiche istantanee sullo stato delle tue spedizioni.'
    }
  ]

  const testimonials = [
    {
      name: 'Marco Rossi',
      role: 'CEO, LogiTech Solutions',
      content: 'Spedire Sicuro ha rivoluzionato il nostro processo di gestione documentale. Efficienza aumentata del 300%.',
      rating: 5
    },
    {
      name: 'Laura Bianchi',
      role: 'Operations Manager, FastShip',
      content: 'Finalmente una piattaforma che capisce le esigenze reali del settore spedizioni. Imprescindibile.',
      rating: 5
    },
    {
      name: 'Giuseppe Verdi',
      role: 'Founder, Express Cargo',
      content: 'La dashboard analytics è incredibile. Abbiamo visibilità totale su ogni documento.',
      rating: 5
    }
  ]

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-white to-secondary-50 dark:from-gray-900 dark:via-gray-900 dark:to-primary-900/20" />

        {/* Floating shapes */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            animate={{ y: [-20, 20, -20] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-20 left-10 w-72 h-72 bg-primary-200/30 dark:bg-primary-500/10 rounded-full blur-3xl"
          />
          <motion.div
            animate={{ y: [20, -20, 20] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            className="absolute bottom-20 right-10 w-96 h-96 bg-secondary-200/30 dark:bg-secondary-500/10 rounded-full blur-3xl"
          />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Hero content */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center px-4 py-2 bg-primary-100 dark:bg-primary-900/30 rounded-full mb-6"
              >
                <span className="w-2 h-2 bg-primary-500 rounded-full mr-2 animate-pulse" />
                <span className="text-sm font-medium text-primary-700 dark:text-primary-300">
                  Nuovo: Dashboard Analytics 2.0
                </span>
              </motion.div>

              <h1 className="text-5xl md:text-6xl lg:text-7xl font-display font-bold leading-tight mb-6">
                Gestisci le tue
                <span className="block gradient-text">Spedizioni</span>
                in Sicurezza
              </h1>

              <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
                La piattaforma all-in-one per caricare, revisionare e approvare
                documenti di spedizione. Veloce, sicura, affidabile.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/dashboard" className="btn-primary inline-flex items-center justify-center">
                  Inizia Gratis
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
                <Link to="/upload" className="btn-secondary inline-flex items-center justify-center">
                  Carica Documento
                </Link>
              </div>

              <div className="mt-8 flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-1" />
                  Setup in 2 minuti
                </div>
                <div className="flex items-center">
                  <Lock className="w-4 h-4 text-green-500 mr-1" />
                  100% Sicuro
                </div>
              </div>
            </motion.div>

            {/* Hero illustration */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="relative hidden lg:block"
            >
              <div className="relative">
                {/* Main card */}
                <motion.div
                  animate={{ y: [-10, 10, -10] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="card p-8"
                >
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 rounded-xl gradient-bg flex items-center justify-center">
                        <FileCheck className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold">Documento Approvato</h3>
                        <p className="text-sm text-gray-500">DOC-2024-0892</p>
                      </div>
                    </div>
                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                      Approvato
                    </span>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Mittente</span>
                      <span className="font-medium">LogiTech Solutions</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Destinatario</span>
                      <span className="font-medium">FastShip Milano</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Data Revisione</span>
                      <span className="font-medium">22 Nov 2024</span>
                    </div>
                  </div>
                </motion.div>

                {/* Floating notification */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1 }}
                  className="absolute -top-4 -right-4 bg-white dark:bg-gray-800 rounded-xl shadow-xl p-4 border border-gray-100 dark:border-gray-700"
                >
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Nuovo documento</p>
                      <p className="text-xs text-gray-500">Appena approvato</p>
                    </div>
                  </div>
                </motion.div>

                {/* Stats badge */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1.2 }}
                  className="absolute -bottom-4 -left-4 bg-white dark:bg-gray-800 rounded-xl shadow-xl p-4 border border-gray-100 dark:border-gray-700"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                      <Clock className="w-5 h-5 text-primary-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold gradient-text">1.5h</p>
                      <p className="text-xs text-gray-500">Tempo medio</p>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-2 md:grid-cols-4 gap-8"
          >
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className="text-center"
              >
                <p className="text-4xl md:text-5xl font-bold gradient-text mb-2">
                  {stat.value}
                </p>
                <p className="text-gray-600 dark:text-gray-400">{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-display font-bold mb-4">
              Perché scegliere <span className="gradient-text">Spedire Sicuro</span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              La soluzione completa per la gestione documentale delle spedizioni
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {features.map((feature, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{ y: -5 }}
                className="card group hover:shadow-2xl transition-all duration-300"
              >
                <div className="w-14 h-14 rounded-xl gradient-bg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-400">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-display font-bold mb-4">
              Come <span className="gradient-text">Funziona</span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Tre semplici passaggi per gestire i tuoi documenti
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid md:grid-cols-3 gap-8"
          >
            {steps.map((step, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className="relative text-center"
              >
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full gradient-bg mb-6">
                  <step.icon className="w-10 h-10 text-white" />
                </div>
                <div className="absolute top-10 left-1/2 w-full h-0.5 bg-gradient-to-r from-primary-500 to-secondary-500 hidden md:block last:hidden" style={{ transform: 'translateX(50%)' }} />
                <h3 className="text-2xl font-semibold mb-3">{step.title}</h3>
                <p className="text-gray-600 dark:text-gray-400">{step.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-display font-bold mb-4">
              Cosa dicono i <span className="gradient-text">Clienti</span>
            </h2>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid md:grid-cols-3 gap-8"
          >
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className="card"
              >
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-600 dark:text-gray-300 mb-6 italic">
                  "{testimonial.content}"
                </p>
                <div>
                  <p className="font-semibold">{testimonial.name}</p>
                  <p className="text-sm text-gray-500">{testimonial.role}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 gradient-bg relative overflow-hidden">
        <div className="absolute inset-0">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
            className="absolute -top-1/2 -right-1/2 w-full h-full bg-white/5 rounded-full"
          />
        </div>

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-display font-bold text-white mb-6">
              Pronto a iniziare?
            </h2>
            <p className="text-xl text-white/80 mb-8">
              Unisciti a centinaia di aziende che già usano Spedire Sicuro
            </p>
            <Link
              to="/dashboard"
              className="inline-flex items-center px-8 py-4 bg-white text-primary-600 font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
            >
              Inizia Ora - È Gratis
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-gray-900 text-gray-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="w-8 h-8 rounded-lg gradient-bg flex items-center justify-center">
                <Package className="w-4 h-4 text-white" />
              </div>
              <span className="font-display font-bold text-white">Spedire Sicuro</span>
            </div>
            <div className="flex items-center space-x-6 text-sm">
              <a href="#" className="hover:text-white transition-colors">Privacy</a>
              <a href="#" className="hover:text-white transition-colors">Termini</a>
              <a href="#" className="hover:text-white transition-colors">Contatti</a>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-800 text-center text-sm">
            <p>© 2024 Spedire Sicuro. Tutti i diritti riservati.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Landing
