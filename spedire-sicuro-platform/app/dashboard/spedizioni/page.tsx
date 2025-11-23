'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase-browser'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import { generateSpedisciCSV, downloadCSV } from '@/lib/adapters/spedisci-csv-adapter'
import { Download, Plus, Search, Loader2, FileEdit } from 'lucide-react'
import Link from 'next/link'

export default function SpedizioniListPage() {
  const [spedizioni, setSpedizioni] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const supabase = createClient()

  useEffect(() => {
    fetchSpedizioni()
  }, [])

  const fetchSpedizioni = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('spedizioni')
        .select('id, created_at, destinatario, indirizzo, cap, localita, provincia, peso, colli, contrassegno, corriere_scelto, servizio_scelto, mittente_nome, mittente_citta')
        .order('created_at', { ascending: false })
      
      if (error) throw error
      setSpedizioni(data || [])
    } catch (error) {
      console.error('Errore recupero spedizioni:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredData = spedizioni.filter(s => 
    s.destinatario?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.localita?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleExportSingle = (spedizione: any) => {
    const csv = generateSpedisciCSV([spedizione])
    downloadCSV(csv, `export_${spedizione.destinatario}.csv`)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Lista Spedizioni</h1>
          <p className="text-slate-500">Gestisci le tue spedizioni e scarica i file per il corriere</p>
        </div>
        <Link href="/dashboard/crea-spedizione">
          <Button className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold shadow-md">
            <Plus className="mr-2 h-4 w-4" /> Nuova Spedizione
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input 
              placeholder="Cerca destinatario o città..." 
              className="pl-10 max-w-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-yellow-500" />
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50">
                    <TableHead>Data</TableHead>
                    <TableHead>Destinatario</TableHead>
                    <TableHead>Destinazione</TableHead>
                    <TableHead>Dettagli</TableHead>
                    <TableHead className="text-right">Azioni</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredData.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-slate-500">
                        Nessuna spedizione trovata
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredData.map((s) => (
                      <TableRow key={s.id} className="hover:bg-slate-50/50">
                        <TableCell className="font-medium text-slate-600">
                          {new Date(s.created_at).toLocaleDateString('it-IT')}
                        </TableCell>
                        <TableCell className="font-bold text-slate-800">
                          {s.destinatario}
                        </TableCell>
                        <TableCell>
                          {s.localita} ({s.provincia})
                        </TableCell>
                        <TableCell>
                          {s.peso}kg • {s.colli} colli
                          {s.contrassegno > 0 && (
                            <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                              COD €{s.contrassegno}
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleExportSingle(s)}
                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                            title="Scarica CSV Spedisci.online"
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
