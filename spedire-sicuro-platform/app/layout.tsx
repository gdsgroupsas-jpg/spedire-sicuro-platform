import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import AuthProvider from '@/components/providers/auth-provider'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="it">
      <body className={inter.className}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
