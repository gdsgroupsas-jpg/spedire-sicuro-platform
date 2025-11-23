'use client'

import Image from 'next/image'
import ListiniManager from '@/components/ListiniManager'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function ListiniPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-400 to-blue-900 p-8">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="outline" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Torna alla Dashboard
              </Button>
            </Link>
            <Image
              src="/logo.jpg"
              alt="Spedire Sicuro"
              width={60}
              height={60}
              className="rounded-full"
            />
            <div>
              <h1 className="text-3xl font-bold text-white">Gestione Listini</h1>
              <p className="text-yellow-300">Carica e gestisci i listini corrieri</p>
            </div>
          </div>
        </div>

        {/* Listini Manager */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <ListiniManager />
        </div>

        {/* Info Box */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-bold text-blue-900 mb-2">📋 Formato File Listino</h3>
          <p className="text-sm text-blue-800 mb-2">
            Il file CSV/Excel deve contenere almeno queste colonne:
          </p>
          <ul className="text-sm text-blue-800 list-disc list-inside space-y-1">
            <li>
              <strong>Peso Min / Peso Max:</strong> Fasce di peso (es: 0, 3, 5, 12...)
            </li>
            <li>
              <strong>Zone:</strong> Colonne con prezzi per zona (Italia, Sardegna, Sicilia,
              Calabria, etc.)
            </li>
          </ul>
          <p className="text-xs text-blue-600 mt-3">
            Il sistema riconoscerà automaticamente le colonne anche con nomi diversi (es: "peso
            minimo", "peso massimo", "italia", "sardegna", etc.)
          </p>
        </div>
      </div>
    </div>
  )
}

