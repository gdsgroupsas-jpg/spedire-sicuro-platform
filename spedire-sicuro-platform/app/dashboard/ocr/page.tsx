'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Upload, Loader2, Check, Download } from 'lucide-react'

export default function OCRPage() {
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
      const reader = new FileReader()
      reader.readAsDataURL(file)
      
      reader.onload = async () => {
        try {
          const base64 = reader.result as string

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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">OCR Scanner</h1>
          <p className="text-slate-500">Carica screenshot per estrarre dati spedizione</p>
        </div>
      </div>

      {/* Upload Card */}
      <Card>
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
            <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-yellow-400 bg-yellow-50 p-12 text-center hover:bg-yellow-100 transition-colors">
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
            <div className="mt-4 rounded-lg bg-red-50 p-4 text-red-700 flex items-center gap-2">
              ❌ {error}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results */}
      {result && (
        <div className="grid gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Extracted Data */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Check className="text-green-600" />
                Dati Estratti
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase">Destinatario</label>
                  <p className="text-lg font-medium">{result.extracted.destinatario}</p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase">Telefono</label>
                  <p className="text-lg font-medium">{result.extracted.telefono}</p>
                </div>
                <div className="md:col-span-2">
                  <label className="text-xs font-semibold text-slate-500 uppercase">Indirizzo</label>
                  <p className="text-lg font-medium">{result.extracted.indirizzo}</p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase">CAP</label>
                  <p className="text-lg font-medium">{result.extracted.cap}</p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase">Città</label>
                  <p className="text-lg font-medium">{result.extracted.localita}</p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase">Provincia</label>
                  <p className="text-lg font-bold text-blue-600">{result.extracted.provincia}</p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase">Peso (kg)</label>
                  <p className="text-lg font-medium">{result.extracted.peso}</p>
                </div>
                <div className="md:col-span-2">
                  <label className="text-xs font-semibold text-slate-500 uppercase">Contenuto</label>
                  <p className="text-lg font-medium">{result.extracted.contenuto}</p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase">Contrassegno</label>
                  <p className="text-lg font-bold text-green-600">€{result.extracted.contrassegno}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Price Comparison */}
          <Card>
            <CardHeader>
              <CardTitle>💰 Comparatore Prezzi</CardTitle>
              <CardDescription>Migliore tariffa calcolata automaticamente</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {result.comparison && result.comparison.length > 0 ? (
                  result.comparison.map((c: any, i: number) => (
                  <div
                    key={c.corriere}
                    className={`flex items-center justify-between rounded-xl p-4 border ${
                      i === 0
                        ? 'bg-green-50 border-green-200 shadow-sm'
                        : 'bg-white border-slate-100'
                    }`}
                  >
                    <div>
                      <p className="font-bold text-lg text-slate-800">
                        {i === 0 && '🥇 '}
                        {c.nome}
                      </p>
                      <p className="text-sm text-slate-500">{c.tempi}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-slate-400 uppercase">Costo</p>
                      <p className="text-xl font-bold text-slate-700">€{c.costo}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-slate-400 uppercase">Prezzo Cliente</p>
                      <p className="text-xl font-bold text-green-600">€{c.prezzoConsigliato}</p>
                    </div>
                    <div className="text-right hidden sm:block">
                      <p className="text-xs text-slate-400 uppercase">Margine</p>
                      <p className="text-lg font-bold text-blue-600">€{c.margine}</p>
                      <p className="text-xs text-blue-400">{c.marginePerc}%</p>
                    </div>
                  </div>
                  ))
                ) : (
                  <div className="rounded-lg bg-yellow-50 p-4 text-yellow-800 text-center border border-yellow-100">
                    ⚠️ Nessun listino attivo trovato per questa configurazione.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex gap-4 pt-4">
            <Button onClick={downloadCSV} size="lg" className="flex-1 bg-blue-600 hover:bg-blue-700">
              <Download className="mr-2 h-5 w-5" />
              Scarica CSV
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              onClick={() => {
                setResult(null)
                setError(null)
              }}
            >
              🔄 Nuova Scansione
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
