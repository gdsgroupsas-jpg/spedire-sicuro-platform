'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Upload, Loader2, Check, X, Trash2, Eye, EyeOff } from 'lucide-react'
import { ListinoCorriere } from '@/lib/types'

export default function ListiniManager() {
  const [file, setFile] = useState<File | null>(null)
  const [fornitore, setFornitore] = useState('')
  const [servizio, setServizio] = useState('')
  const [uploading, setUploading] = useState(false)
  const [listini, setListini] = useState<ListinoCorriere[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadListini()
  }, [])

  const loadListini = async () => {
    try {
      const res = await fetch('/api/listini')
      const data = await res.json()
      if (data.success) {
        setListini(data.data || [])
      }
    } catch (error) {
      console.error('Errore caricamento listini:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpload = async () => {
    if (!file || !fornitore || !servizio) {
      alert('Compila tutti i campi: Fornitore, Servizio e File')
      return
    }

    setUploading(true)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('fornitore', fornitore)
      formData.append('servizio', servizio)

      const res = await fetch('/api/listini/upload', {
        method: 'POST',
        body: formData,
      })

      const data = await res.json()

      if (data.success) {
        alert('✅ Listino caricato con successo!')
        setFile(null)
        setFornitore('')
        setServizio('')
        loadListini()
      } else {
        alert(`❌ Errore: ${data.error}`)
      }
    } catch (error: any) {
      alert(`❌ Errore upload: ${error.message}`)
    } finally {
      setUploading(false)
    }
  }

  const toggleAttivo = async (id: string, attivo: boolean) => {
    try {
      const res = await fetch('/api/listini', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, attivo: !attivo }),
      })

      const data = await res.json()
      if (data.success) {
        loadListini()
      } else {
        alert(`Errore: ${data.error}`)
      }
    } catch (error: any) {
      alert(`Errore: ${error.message}`)
    }
  }

  const deleteListino = async (id: string) => {
    if (!confirm('Sei sicuro di voler eliminare questo listino?')) return

    try {
      const res = await fetch(`/api/listini?id=${id}`, {
        method: 'DELETE',
      })

      const data = await res.json()
      if (data.success) {
        loadListini()
      } else {
        alert(`Errore: ${data.error}`)
      }
    } catch (error: any) {
      alert(`Errore: ${error.message}`)
    }
  }

  return (
    <div className="space-y-6">
      {/* Upload Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Carica Nuovo Listino
          </CardTitle>
          <CardDescription>
            Carica un file CSV o Excel con i prezzi del corriere
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Fornitore</label>
              <Input
                placeholder="es: Speedgo, Spedizioni Prime"
                value={fornitore}
                onChange={(e) => setFornitore(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Servizio</label>
              <Input
                placeholder="es: GLS BA, PD1, SDA H24+"
                value={servizio}
                onChange={(e) => setServizio(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">File Listino</label>
            <Input
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
            <p className="text-xs text-gray-500 mt-1">
              Formati supportati: CSV, Excel (.xlsx, .xls) - Max 10MB
            </p>
          </div>

          <Button
            onClick={handleUpload}
            disabled={uploading || !file || !fornitore || !servizio}
            className="w-full"
          >
            {uploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Caricamento...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Carica Listino
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Lista Listini */}
      <Card>
        <CardHeader>
          <CardTitle>Listini Caricati</CardTitle>
          <CardDescription>
            Gestisci i listini corrieri attivi nel sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : listini.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Nessun listino caricato. Carica il primo listino qui sopra.
            </div>
          ) : (
            <div className="space-y-3">
              {listini.map((listino) => (
                <div
                  key={listino.id}
                  className={`flex items-center justify-between p-4 rounded-lg border ${
                    listino.attivo
                      ? 'bg-green-50 border-green-200'
                      : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold">
                        {listino.fornitore} - {listino.servizio}
                      </h3>
                      {listino.attivo ? (
                        <span className="text-xs bg-green-500 text-white px-2 py-1 rounded">
                          ATTIVO
                        </span>
                      ) : (
                        <span className="text-xs bg-gray-500 text-white px-2 py-1 rounded">
                          DISATTIVATO
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      File: {listino.file_originale} • Zone: {listino.zone_coperte?.join(', ') || 'N/A'} • 
                      Peso max: {listino.peso_max || 'N/A'} kg
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      Caricato: {new Date(listino.created_at).toLocaleDateString('it-IT')}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleAttivo(listino.id, listino.attivo)}
                    >
                      {listino.attivo ? (
                        <>
                          <EyeOff className="h-4 w-4 mr-1" />
                          Disattiva
                        </>
                      ) : (
                        <>
                          <Eye className="h-4 w-4 mr-1" />
                          Attiva
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteListino(listino.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

