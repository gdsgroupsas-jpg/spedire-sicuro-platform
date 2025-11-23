'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Upload, Loader2, Check, Download } from 'lucide-react'

export default function DashboardPage() {
  const [uploading, setUploading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    setError(null)
    setResult(null)

    try {
      // Convert to base64
      const reader = new FileReader()
      reader.readAsDataURL(file)
      
      reader.onload = async () => {
        try {
          const base64 = reader.result as string

          // Call OCR API
          const response = await fetch('/api/ocr', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ image: base64 }),
          })

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({ error: 'Errore sconosciuto' }))
            throw new Error(errorData.error || errorData.details || `Errore OCR (${response.status})`)
          }

          const data = await response.json()
          setResult(data)
          setUploading(false)
        } catch (err: any) {
          setError(err.message || 'Errore durante elaborazione OCR')
          setUploading(false)
        }
      }

      reader.onerror = () => {
        setError('Errore lettura file')
        setUploading(false)
      }
    } catch (err: any) {
      setError(err.message)
      setUploading(false)
    }
  }

  const downloadCSV = async () => {
    if (!result) return

    const response = await fetch('/api/csv', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ shipments: [result.extracted] }),
    })

    const blob = await response.blob()
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `spedizione-${Date.now()}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-400 to-blue-900 p-8">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Image src="/logo.jpg" alt="Spedire Sicuro" width={60} height={60} className="rounded-full" />
            <div>
              <h1 className="text-3xl font-bold text-white">Spedire Sicuro Platform</h1>
              <p className="text-yellow-300">Gestione Spedizioni AI-Powered</p>
            </div>
          </div>
          <Link href="/listini">
            <Button variant="outline" className="bg-white/10 text-white border-white/20 hover:bg-white/20">
              📋 Gestione Listini
            </Button>
          </Link>
        </div>

        {/* Upload Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              📸 Carica Screenshot WhatsApp
            </CardTitle>
            <CardDescription>
              L'AI leggerà automaticamente tutti i dati dell'ordine
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                disabled={uploading}
                className="absolute inset-0 z-10 cursor-pointer opacity-0"
              />
              <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-yellow-400 bg-yellow-50 p-12 text-center">
                {uploading ? (
                  <>
                    <Loader2 className="h-12 w-12 animate-spin text-yellow-600" />
                    <p className="mt-4 text-lg font-medium">🤖 AI sta leggendo...</p>
                  </>
                ) : (
                  <>
                    <Upload className="h-12 w-12 text-yellow-600" />
                    <p className="mt-4 text-lg font-medium">Trascina screenshot o clicca per selezionare</p>
                    <p className="mt-2 text-sm text-gray-500">JPG, PNG fino a 10MB</p>
                  </>
                )}
              </div>
            </div>

            {error && (
              <div className="mt-4 rounded-lg bg-red-50 p-4 text-red-700">
                ❌ {error}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Results */}
        {result && (
          <>
            {/* Extracted Data */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Check className="text-green-600" />
                  Dati Estratti
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Destinatario</label>
                    <p className="text-lg">{result.extracted.destinatario}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Telefono</label>
                    <p className="text-lg">{result.extracted.telefono}</p>
                  </div>
                  <div className="col-span-2">
                    <label className="text-sm font-medium text-gray-500">Indirizzo</label>
                    <p className="text-lg">{result.extracted.indirizzo}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">CAP</label>
                    <p className="text-lg">{result.extracted.cap}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Città</label>
                    <p className="text-lg">{result.extracted.localita}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Provincia</label>
                    <p className="text-lg font-bold">{result.extracted.provincia}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Peso (kg)</label>
                    <p className="text-lg">{result.extracted.peso}</p>
                  </div>
                  <div className="col-span-2">
                    <label className="text-sm font-medium text-gray-500">Contenuto</label>
                    <p className="text-lg">{result.extracted.contenuto}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Contrassegno</label>
                    <p className="text-lg font-bold text-green-600">€{result.extracted.contrassegno}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Price Comparison */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>💰 Comparatore Prezzi</CardTitle>
                <CardDescription>Migliore tariffa automatica</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {result.comparison && result.comparison.length > 0 ? (
                    result.comparison.map((c: any, i: number) => (
                    <div
                      key={c.corriere}
                      className={`flex items-center justify-between rounded-lg p-4 ${
                        i === 0
                          ? 'bg-green-50 border-2 border-green-500'
                          : 'bg-gray-50 border border-gray-200'
                      }`}
                    >
                      <div>
                        <p className="font-bold">
                          {i === 0 && '🥇 '}
                          {c.nome}
                        </p>
                        <p className="text-sm text-gray-500">{c.tempi}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500">Costo</p>
                        <p className="text-2xl font-bold">€{c.costo}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500">Prezzo Cliente</p>
                        <p className="text-2xl font-bold text-green-600">€{c.prezzoConsigliato}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500">Margine</p>
                        <p className="text-xl font-bold text-blue-600">€{c.margine}</p>
                        <p className="text-sm text-gray-500">{c.marginePerc}%</p>
                      </div>
                    </div>
                    ))
                  ) : (
                    <div className="rounded-lg bg-yellow-50 p-4 text-yellow-700">
                      ⚠️ Nessun listino caricato. Vai su <Link href="/listini" className="underline font-bold">Gestione Listini</Link> per caricare i listini corrieri.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex gap-4">
              <Button onClick={downloadCSV} size="lg" className="flex-1">
                <Download className="mr-2" />
                📥 Download CSV Spedisci.online
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                onClick={() => {
                  setResult(null)
                  setError(null)
                }}
              >
                🔄 Nuova Spedizione
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
