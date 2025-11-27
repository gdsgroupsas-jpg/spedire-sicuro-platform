"use client"

import { useState, useEffect, useMemo } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ListinoCorriere, DatiListino } from '@/lib/types'
import { formatCurrency } from '@/lib/utils'
import { motion, AnimatePresence } from "framer-motion"
import { 
  Upload, 
  FileSpreadsheet, 
  Search, 
  Trash2, 
  AlertCircle, 
  AlertTriangle,
  Loader2 
} from "lucide-react"

type ApiResponse = {
  success: boolean
  data?: ListinoCorriere[]
  error?: string
}

const getSamplePrice = (listino: ListinoCorriere) => {
  const data = listino.dati_listino as DatiListino | undefined
  if (!data || !Array.isArray(data.fasce) || data.fasce.length === 0) return null
  const firstFascia = data.fasce[0]
  if (!firstFascia?.prezzi) return null
  if (firstFascia.prezzi.italia) return firstFascia.prezzi.italia
  const [firstZone] = Object.keys(firstFascia.prezzi)
  return firstZone ? firstFascia.prezzi[firstZone] : null
}

export default function ListiniManager() {
  const [file, setFile] = useState<File | null>(null)
  const [fornitore, setFornitore] = useState('')
  const [servizio, setServizio] = useState('')
  const [uploading, setUploading] = useState(false)
  const [listini, setListini] = useState<ListinoCorriere[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [showUpload, setShowUpload] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadListini()
  }, [])

  const loadListini = async () => {
    setLoading(true)
    setError(null)
    setListini([])

    try {
      const res = await fetch('/api/listini')
      if (!res.ok) {
        const errorBody = await res.text().catch(() => 'Nessun dettaglio disponibile.')
        throw new Error(
          `Errore HTTP ${res.status}: Impossibile recuperare i listini. Server side fail? Dettagli: ${errorBody.substring(0, 100)}...`
        )
      }

      const data: ApiResponse = await res.json()

      if (data.success) {
        setListini(data.data || [])
      } else {
        throw new Error(`API Response Error: ${data.error || 'Dati non validi o campo success: false.'}`)
      }
    } catch (e: any) {
      console.error('Errore CRITICO caricamento listini:', e)
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const deleteListino = async (id: string) => {
    if (!confirm('Sei sicuro di voler eliminare questo listino?')) return
    try {
      setError(null)
      const res = await fetch(`/api/listini?id=${id}`, { method: 'DELETE' })
      const body = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(body.error || 'Eliminazione fallita')
      await loadListini()
    } catch (e: any) {
      setError(e.message || 'Errore eliminazione listino')
    }
  }

  const toggleAttivo = async (id: string, attivo: boolean) => {
    try {
      setError(null)
      const res = await fetch('/api/listini', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, attivo: !attivo }),
      })
      const body = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(body.error || 'Aggiornamento fallito')
      await loadListini()
    } catch (e: any) {
      setError(e.message || 'Errore aggiornamento stato listino')
    }
  }

  const handleUpload = async () => {
    if (!file || !fornitore || !servizio) {
      setError('Compila fornitore, servizio e seleziona un file.')
      return
    }

    setUploading(true)
    setError(null)

    const formData = new FormData()
    formData.append('file', file)
    formData.append('fornitore', fornitore)
    formData.append('servizio', servizio)

    try {
      const response = await fetch('/api/listini/upload', {
        method: 'POST',
        body: formData,
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Upload fallito')
      alert(`✅ Successo! Importate ${result?.data?.fasce_count ?? 0} fasce.`)
      setFile(null)
      setFornitore('')
      setServizio('')
      setShowUpload(false)
      await loadListini()
    } catch (e: any) {
      console.error(e)
      setError(e.message || 'Errore durante upload listino.')
    } finally {
      setUploading(false)
    }
  }

  const stats = useMemo(() => {
    const couriers = new Set(listini.map(l => l.fornitore)).size
    return {
      total: listini.length,
      couriers,
    }
  }, [listini])

  const filteredListini = useMemo(() => {
    if (!Array.isArray(listini)) return []
    return listini.filter(l =>
      `${l.fornitore} ${l.servizio}`.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [listini, searchTerm])

  return (
    <div className="space-y-8">
      {/* Header & Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-amber-50 border-amber-200">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 bg-amber-500 rounded-full text-white">
              <FileSpreadsheet className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Tariffe Attive</p>
              <h3 className="text-2xl font-bold text-gray-900">{stats.total}</h3>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 bg-blue-500 rounded-full text-white">
              <Search className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Corrieri</p>
              <h3 className="text-2xl font-bold text-gray-900">{stats.couriers}</h3>
            </div>
          </CardContent>
        </Card>
        <Card className="border-dashed border-2 border-gray-300 flex items-center justify-center text-center">
          <div className="space-y-2">
            <p className="text-sm text-gray-500">Nuovo listino</p>
            <Button variant="outline" onClick={() => setShowUpload(v => !v)}>
              <Upload className="h-4 w-4 mr-2" />
              {showUpload ? 'Chiudi upload' : 'Carica CSV'}
            </Button>
          </div>
        </Card>
      </div>

      {/* Tools Bar */}
      <div className="flex flex-col md:flex-row gap-4 md:items-center bg-white p-4 rounded-lg shadow-sm border">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Cerca per corriere o servizio..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button variant="outline" size="sm" onClick={loadListini}>
          <Loader2 className="h-4 w-4 mr-2" /> Aggiorna
        </Button>
      </div>

      {/* Upload form */}
      {showUpload && (
        <div className="bg-white border rounded-xl p-6 shadow-sm space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              placeholder="Fornitore"
              value={fornitore}
              onChange={(e) => setFornitore(e.target.value)}
            />
            <Input
              placeholder="Servizio"
              value={servizio}
              onChange={(e) => setServizio(e.target.value)}
            />
            <Input
              type="file"
              accept=".csv,.xlsx"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
          </div>
          <div className="flex gap-3">
            <Button onClick={handleUpload} disabled={uploading}>
              {uploading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Carica listino
            </Button>
            <Button variant="ghost" onClick={() => { setFile(null); setFornitore(''); setServizio('') }}>
              <Trash2 className="h-4 w-4 mr-2" /> Reset
            </Button>
          </div>
        </div>
      )}

      {/* Listini Grid */}
      {error ? (
        <div className="text-center py-16 bg-red-50 rounded-xl border-2 border-red-300 shadow-xl">
          <AlertTriangle className="h-10 w-10 text-red-600 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-red-800">☠️ Errore Critico di Caricamento Dati ☠️</h3>
          <p className="text-red-700 max-w-lg mx-auto mt-2 text-sm">
            Impossibile recuperare i listini corrieri: <span className="font-mono break-all">{error}</span>
          </p>
          <p className="text-sm text-red-600 mt-2">
            Verifica lo stato dell'API `/api/listini` e la tua connessione DB.
          </p>
          <Button
            variant="outline"
            className="mt-4 border-red-400 text-red-600 hover:bg-red-100"
            onClick={loadListini}
          >
            Riprova Caricamento
          </Button>
        </div>
      ) : loading ? (
        <div className="flex flex-col items-center justify-center py-12 text-slate-400">
          <Loader2 className="h-10 w-10 animate-spin mb-4 text-yellow-500" />
          <p>Caricamento listini in corso...</p>
        </div>
      ) : filteredListini.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-dashed border-slate-200">
          <AlertCircle className="h-10 w-10 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-700">Nessun listino trovato</h3>
          <p className="text-sm text-slate-500 mt-2">
            Carica un CSV oppure prova ad aggiornare la ricerca.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-gray-700 font-semibold uppercase text-xs">
                <tr>
                  <th className="px-6 py-3">Corriere</th>
                  <th className="px-6 py-3">Servizio</th>
                  <th className="px-6 py-3">Zone</th>
                  <th className="px-6 py-3 text-center">Peso max</th>
                  <th className="px-6 py-3 text-right">Prezzo indicativo</th>
                  <th className="px-6 py-3 text-right">Stato</th>
                  <th className="px-6 py-3 text-right">Azioni</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                <AnimatePresence>
                  {filteredListini.map((listino) => {
                    const samplePrice = getSamplePrice(listino)
                    return (
                      <motion.tr
                        key={listino.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="hover:bg-gray-50 transition-colors cursor-pointer"
                        onClick={() => setExpandedId(expandedId === listino.id ? null : listino.id)}
                      >
                        <td className="px-6 py-3 font-medium text-gray-900">{listino.fornitore}</td>
                        <td className="px-6 py-3 text-gray-600">{listino.servizio}</td>
                        <td className="px-6 py-3">
                          <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                            {(listino.zone_coperte || []).slice(0, 2).join(', ') || 'Italia'}
                          </span>
                        </td>
                        <td className="px-6 py-3 text-center text-gray-500">
                          {listino.peso_max ? `${listino.peso_max} kg` : 'N/D'}
                        </td>
                        <td className="px-6 py-3 text-right font-bold text-amber-600">
                          {samplePrice ? formatCurrency(samplePrice as number) : 'N/D'}
                        </td>
                        <td className="px-6 py-3 text-right">
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${listino.attivo ? 'bg-green-100 text-green-700' : 'bg-slate-200 text-slate-600'}`}>
                            {listino.attivo ? 'Attivo' : 'Bozza'}
                          </span>
                        </td>
                        <td className="px-6 py-3 text-right space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation()
                              toggleAttivo(listino.id, listino.attivo)
                            }}
                          >
                            {listino.attivo ? 'Disattiva' : 'Attiva'}
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={(e) => {
                              e.stopPropagation()
                              deleteListino(listino.id)
                            }}
                          >
                            Elimina
                          </Button>
                        </td>
                      </motion.tr>
                    )
                  })}
                </AnimatePresence>
                {expandedId && (
                  <tr className="bg-slate-50">
                    <td colSpan={7} className="px-6 py-4 text-sm text-slate-600">
                      <pre className="text-xs bg-white border rounded p-4 overflow-auto max-h-64">
                        {JSON.stringify(
                          filteredListini.find((l) => l.id === expandedId)?.dati_listino,
                          null,
                          2
                        )}
                      </pre>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
