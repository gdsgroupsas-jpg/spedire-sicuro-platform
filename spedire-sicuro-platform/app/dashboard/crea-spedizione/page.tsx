'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { shipmentSchema, type ShipmentFormValues } from '@/lib/schemas/shipment'
import { generateSpedisciCSV, downloadCSV } from '@/lib/adapters/spedisci-csv-adapter'
import { createClient } from '@/lib/supabase-browser'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Loader2, Save, Download, Package, MapPin, Euro, PackagePlus, Truck } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function CreateShipmentPage() {
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const form = useForm<ShipmentFormValues>({
    resolver: zodResolver(shipmentSchema),
    defaultValues: {
      country: 'IT',
      colli: 1,
      contrassegno: 0,
      peso: 1,
      email_destinatario: undefined,
      order_id: undefined,
      rif_mittente: undefined,
      note: undefined,
      usa_mittente_default: true,
    }
  })

  const usaMittenteDefault = form.watch('usa_mittente_default')

  const onSubmit = async (data: ShipmentFormValues) => {
    setLoading(true)
    try {
      // 1. Salva nel DB via API
      const response = await fetch('/api/shipments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, status: 'bozza' }),
      })

      if (!response.ok) {
        const res = await response.json()
        throw new Error(res.message || res.error || 'Errore salvataggio')
      }

      // 2. Feedback
      alert('Spedizione salvata con successo!')
      
      // 3. Redirect o Reset
      // router.push('/dashboard/spedizioni')
      
    } catch (error: any) {
      alert(`Errore salvataggio: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveAndExport = async () => {
    const isValid = await form.trigger()
    if (!isValid) return

    const data = form.getValues()
    setLoading(true)
    try {
      // 1. Salva (via API)
      const response = await fetch('/api/shipments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, status: 'export_csv' }),
      })

      if (!response.ok) {
        const res = await response.json()
        throw new Error(res.message || res.error || 'Errore durante export')
      }

      // 2. Genera & Scarica CSV
      const csvContent = generateSpedisciCSV([data])
      downloadCSV(csvContent, `spedizione_${data.destinatario.replace(/\s+/g, '_')}.csv`)
      
      alert('Spedizione salvata ed export CSV avviato!')
      router.push('/dashboard/spedizioni')

    } catch (error: any) {
      alert(`Errore durante export: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Nuova Spedizione</h1>
          <p className="text-slate-500">Crea una spedizione manuale ed esporta per Spedisci.online</p>
        </div>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Colonna Sinistra: Dati Destinatario e Mittente */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Card Mittente */}
          <Card>
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-slate-800">
                  <Truck className="h-5 w-5" />
                  Mittente
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Label htmlFor="use-default-sender" className="text-sm text-slate-600 cursor-pointer">Usa predefinito</Label>
                  <Switch
                    id="use-default-sender"
                    checked={usaMittenteDefault}
                    onCheckedChange={(checked) => form.setValue('usa_mittente_default', checked)}
                  />
                </div>
              </div>
            </CardHeader>
            {!usaMittenteDefault && (
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2 pt-0">
                <div className="md:col-span-2">
                  <Label>Nome Mittente / Azienda</Label>
                  <Input {...form.register('mittente_nome')} placeholder="La Tua Azienda SRL" />
                  {form.formState.errors.mittente_nome && <p className="text-xs text-red-500 mt-1">{form.formState.errors.mittente_nome.message}</p>}
                </div>
                <div className="md:col-span-2">
                  <Label>Indirizzo</Label>
                  <Input {...form.register('mittente_indirizzo')} placeholder="Via del Magazzino 1" />
                  {form.formState.errors.mittente_indirizzo && <p className="text-xs text-red-500 mt-1">{form.formState.errors.mittente_indirizzo.message}</p>}
                </div>
                <div>
                  <Label>CAP</Label>
                  <Input {...form.register('mittente_cap')} placeholder="00100" maxLength={5} />
                  {form.formState.errors.mittente_cap && <p className="text-xs text-red-500 mt-1">{form.formState.errors.mittente_cap.message}</p>}
                </div>
                <div>
                  <Label>Città</Label>
                  <Input {...form.register('mittente_citta')} placeholder="Roma" />
                  {form.formState.errors.mittente_citta && <p className="text-xs text-red-500 mt-1">{form.formState.errors.mittente_citta.message}</p>}
                </div>
                <div>
                  <Label>Provincia</Label>
                  <Input {...form.register('mittente_provincia')} placeholder="RM" maxLength={2} className="uppercase" />
                  {form.formState.errors.mittente_provincia && <p className="text-xs text-red-500 mt-1">{form.formState.errors.mittente_provincia.message}</p>}
                </div>
                <div>
                  <Label>Telefono</Label>
                  <Input {...form.register('mittente_telefono')} placeholder="333..." />
                </div>
                <div className="md:col-span-2">
                  <Label>Email</Label>
                  <Input {...form.register('mittente_email')} placeholder="logistica@azienda.it" />
                </div>
              </CardContent>
            )}
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-600">
                <MapPin className="h-5 w-5" />
                Destinatario
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Label>Nome e Cognome / Ragione Sociale</Label>
                <Input {...form.register('destinatario')} placeholder="Mario Rossi" />
                {form.formState.errors.destinatario && <p className="text-xs text-red-500 mt-1">{form.formState.errors.destinatario.message}</p>}
              </div>
              
              <div className="md:col-span-2">
                <Label>Indirizzo Completo</Label>
                <Input {...form.register('indirizzo')} placeholder="Via Roma 123" />
                {form.formState.errors.indirizzo && <p className="text-xs text-red-500 mt-1">{form.formState.errors.indirizzo.message}</p>}
              </div>

              <div>
                <Label>CAP</Label>
                <Input {...form.register('cap')} placeholder="00100" maxLength={5} />
                {form.formState.errors.cap && <p className="text-xs text-red-500 mt-1">{form.formState.errors.cap.message}</p>}
              </div>

              <div>
                <Label>Città</Label>
                <Input {...form.register('localita')} placeholder="Roma" />
                {form.formState.errors.localita && <p className="text-xs text-red-500 mt-1">{form.formState.errors.localita.message}</p>}
              </div>

              <div>
                <Label>Provincia (Sigla)</Label>
                <Input {...form.register('provincia')} placeholder="RM" maxLength={2} className="uppercase" />
                {form.formState.errors.provincia && <p className="text-xs text-red-500 mt-1">{form.formState.errors.provincia.message}</p>}
              </div>

              <div>
                <Label>Telefono</Label>
                <Input {...form.register('telefono')} placeholder="3331234567" />
                {form.formState.errors.telefono && <p className="text-xs text-red-500 mt-1">{form.formState.errors.telefono.message}</p>}
              </div>
              
              <div className="md:col-span-2">
                <Label>Email (Opzionale)</Label>
                <Input {...form.register('email_destinatario')} placeholder="email@cliente.it" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-orange-600">
                <Package className="h-5 w-5" />
                Dati Pacco
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label>Peso (kg)</Label>
                <Input type="number" step="0.1" {...form.register('peso')} />
                {form.formState.errors.peso && <p className="text-xs text-red-500 mt-1">{form.formState.errors.peso.message}</p>}
              </div>
              
              <div>
                <Label>Colli</Label>
                <Input type="number" {...form.register('colli')} />
              </div>

              <div>
                <Label>Contrassegno (€)</Label>
                <Input type="number" step="0.01" {...form.register('contrassegno')} />
              </div>

              <div className="md:col-span-3">
                <Label>Contenuto</Label>
                <Input {...form.register('contenuto')} placeholder="Es: Abbigliamento, Documenti..." />
                {form.formState.errors.contenuto && <p className="text-xs text-red-500 mt-1">{form.formState.errors.contenuto.message}</p>}
              </div>

              <div className="md:col-span-3">
                <Label>Note per Corriere</Label>
                <Textarea {...form.register('note')} placeholder="Es: Suonare Interfono Rossi" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sticky Mobile Footer Actions */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] md:hidden z-50 flex gap-3 items-center justify-between animate-in slide-in-from-bottom">
          <Button 
            type="button"
            variant="outline"
            onClick={handleSaveAndExport}
            disabled={loading}
            className="flex-1 border-green-600 text-green-600"
          >
            <Download className="h-4 w-4 mr-2" />
            CSV
          </Button>
          <Button 
            type="submit" 
            className="flex-[2] bg-blue-600 hover:bg-blue-700 shadow-lg"
            disabled={loading}
          >
             {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <PackagePlus className="mr-2 h-4 w-4" />}
             CREA SPEDIZIONE
          </Button>
        </div>

        {/* Colonna Destra: Azioni e Riepilogo (Desktop) */}
        <div className="space-y-6 hidden md:block">
          <Card className="border-blue-200 bg-blue-50 sticky top-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-800">
                <Save className="h-5 w-5" />
                Salvataggio
              </CardTitle>
              <CardDescription>Salva nel gestionale o esporta subito</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                type="submit" 
                className="w-full bg-blue-600 hover:bg-blue-700 shadow-md transition-all hover:scale-[1.02]"
                disabled={loading}
                size="lg"
              >
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <PackagePlus className="mr-2 h-5 w-5" />}
                Crea Spedizione
              </Button>
              
              <div className="relative py-2">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-blue-200" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-blue-50 px-2 text-blue-400 font-bold">OPPURE</span>
                </div>
              </div>

              <Button 
                type="button" 
                onClick={handleSaveAndExport}
                className="w-full bg-green-600 hover:bg-green-700 shadow-sm"
                disabled={loading}
              >
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
                Salva & Export CSV
              </Button>
              <p className="text-xs text-center text-slate-500 mt-2">
                Genera CSV compatibile con Spedisci.online
              </p>
            </CardContent>
          </Card>
          
          <Card>
             <CardHeader>
                <CardTitle className="text-sm text-slate-500 uppercase">Info Interne</CardTitle>
             </CardHeader>
             <CardContent className="space-y-3">
                <div>
                    <Label>Rif. Ordine (Opzionale)</Label>
                    <Input {...form.register('order_id')} placeholder="#ORD-2024-001" />
                </div>
                <div>
                    <Label>Rif. Mittente</Label>
                    <Input {...form.register('rif_mittente')} />
                </div>
             </CardContent>
          </Card>
        </div>
      </form>
    </div>
  )
}
