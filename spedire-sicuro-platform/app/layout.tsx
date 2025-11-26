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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
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
