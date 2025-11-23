'use client'

import { useState, useEffect, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Upload, Loader2, Trash2, Eye, EyeOff, ChevronDown, Search, Filter, Package, Truck, Box, Plus, BarChart, Award, AlertTriangle, FileText, Calculator, Save } from 'lucide-react'
import { ListinoCorriere } from '@/lib/types'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'

// --- Sub-components ---

const CarrierLogo = ({ carrier }: { carrier: string }) => {
  const normalized = carrier.toLowerCase()
  let icon = <Truck className="h-6 w-6 text-slate-500" />
  let bgColor = "bg-slate-100"

  if (normalized.includes('gls')) {
    icon = <span className="font-black text-blue-900">GLS</span>
    bgColor = "bg-yellow-400"
  } else if (normalized.includes('sda')) {
    icon = <span className="font-black text-white">SDA</span>
    bgColor = "bg-blue-600"
  } else if (normalized.includes('brt') || normalized.includes('bartolini')) {
    icon = <span className="font-black text-white">BRT</span>
    bgColor = "bg-red-600"
  } else if (normalized.includes('dhl')) {
    icon = <span className="font-black text-red-700 italic">DHL</span>
    bgColor = "bg-yellow-300"
  } else if (normalized.includes('ups')) {
    icon = <span className="font-black text-white">UPS</span>
    bgColor = "bg-amber-900"
  }

  return (
    <div className={cn("h-10 w-10 rounded-lg flex items-center justify-center shadow-sm", bgColor)}>
      {icon}
    </div>
  )
}

const StatusBadge = ({ active }: { active: boolean }) => {
  return (
    <span className={cn(
      "px-2.5 py-0.5 rounded-full text-xs font-medium border shadow-sm",
      active 
        ? "bg-green-50 text-green-700 border-green-200" 
        : "bg-slate-50 text-slate-600 border-slate-200"
    )}>
      {active ? (
        <span className="flex items-center gap-1.5">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
          </span>
          Attivo
        </span>
      ) : 'Disattivato'}
    </span>
  )
}


const MarkupSimulator = ({ listino, onClose, onSave }: { 
  listino: ListinoCorriere, 
  onClose: () => void,
  onSave: (newListino: ListinoCorriere) => void
}) => {
  const [markupPercent, setMarkupPercent] = useState(0)
  const [markupFixed, setMarkupFixed] = useState(0)
  const [roundPrices, setRoundPrices] = useState(false)
  const [newName, setNewName] = useState(`${listino.servizio} (Vendita)`)
  const [saving, setSaving] = useState(false)

  // Calculate new prices live
  const simulatedData = useMemo(() => {
    const newData = JSON.parse(JSON.stringify(listino.dati_listino)) // deep clone
    
    newData.fasce.forEach((fascia: any) => {
      Object.keys(fascia.prezzi).forEach(zone => {
        let price = fascia.prezzi[zone]
        if (!price) return

        // 1. Apply Percent
        price = price * (1 + markupPercent / 100)
        // 2. Apply Fixed
        price = price + markupFixed
        // 3. Round
        if (roundPrices) {
          price = Math.ceil(price) - 0.10 // Round to .90
          if (price < fascia.prezzi[zone]) price += 1 // Ensure markup not lost
        }

        fascia.prezzi[zone] = Number(price.toFixed(2))
      })
    })
    return newData
  }, [listino.dati_listino, markupPercent, markupFixed, roundPrices])

  const handleSave = async () => {
    setSaving(true)
    try {
        // Logic to save would go here - simulating API call
        await new Promise(r => setTimeout(r, 1000))
        
        const newListino = {
            ...listino,
            id: `temp-${Date.now()}`, // In real app this comes from DB
            servizio: newName,
            dati_listino: simulatedData,
            created_at: new Date().toISOString(),
            note: `Generato da ${listino.servizio} con markup ${markupPercent}% + ${markupFixed}€`,
            // In a real app we would POST to create this
        }
        onSave(newListino)
        onClose()
    } catch (error) {
        console.error(error)
    } finally {
        setSaving(false)
    }
  }

  return (
    <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 shadow-inner mb-6 animate-in slide-in-from-top-5 duration-300">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
          <Calculator className="h-5 w-5 text-blue-600" />
          Simulatore Prezzi di Vendita
        </h3>
        <Button variant="ghost" size="sm" onClick={onClose}>Chiudi</Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Controls */}
        <div className="space-y-6 bg-white p-5 rounded-lg shadow-sm border border-slate-100 h-fit">
          <div className="space-y-3">
            <Label>Nome Nuovo Listino</Label>
            <Input value={newName} onChange={(e) => setNewName(e.target.value)} />
          </div>

          <div className="space-y-4">
            <div className="flex justify-between">
               <Label>Markup Percentuale</Label>
               <span className="text-sm font-bold text-blue-600">+{markupPercent}%</span>
            </div>
            <Slider 
               value={[markupPercent]} 
               onValueChange={(vals) => setMarkupPercent(vals[0])} 
               max={100} 
               step={1} 
               className="py-2"
            />
          </div>

          <div className="space-y-4">
            <div className="flex justify-between">
               <Label>Markup Fisso (€)</Label>
               <span className="text-sm font-bold text-blue-600">+{markupFixed}€</span>
            </div>
            <Slider 
               value={[markupFixed]} 
               onValueChange={(vals) => setMarkupFixed(vals[0])} 
               max={20} 
               step={0.5} 
               className="py-2"
            />
          </div>

          <div className="flex items-center justify-between pt-2">
             <Label htmlFor="round">Arrotonda prezzi (.90)</Label>
             <Switch id="round" checked={roundPrices} onCheckedChange={setRoundPrices} />
          </div>

          <Button className="w-full mt-4 bg-blue-600 hover:bg-blue-700" onClick={handleSave} disabled={saving}>
            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Salva Listino Vendita
          </Button>
        </div>

        {/* Preview */}
        <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
                <Label className="text-slate-500">Anteprima Prezzi (Prime 5 fasce)</Label>
                <div className="text-xs text-slate-400 flex gap-4">
                    <span className="flex items-center gap-1"><div className="w-2 h-2 bg-slate-300 rounded-full"></div> Costo Originale</span>
                    <span className="flex items-center gap-1"><div className="w-2 h-2 bg-green-500 rounded-full"></div> Prezzo Vendita</span>
                </div>
            </div>
            
            <div className="overflow-hidden rounded-lg border border-slate-200">
               <table className="w-full text-sm">
                  <thead className="bg-slate-100 text-slate-600 text-xs uppercase">
                    <tr>
                        <th className="px-4 py-2 text-left">Peso</th>
                        <th className="px-4 py-2 text-left">Zona A (IT)</th>
                        <th className="px-4 py-2 text-left">Zona B (Islands)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {simulatedData.fasce.slice(0, 5).map((fascia: any, i: number) => {
                        const originalRow = listino.dati_listino.fasce[i]
                        // Get first 2 zones for preview
                        const zones = Object.keys(fascia.prezzi).slice(0, 2)
                        
                        return (
                            <tr key={i}>
                                <td className="px-4 py-3 font-medium text-slate-700">{fascia.peso_min}-{fascia.peso_max} kg</td>
                                {zones.map(z => (
                                    <td key={z} className="px-4 py-3">
                                        <div className="flex flex-col">
                                            <span className="text-xs text-slate-400 line-through">
                                                € {originalRow.prezzi[z]?.toFixed(2)}
                                            </span>
                                            <span className="font-bold text-green-600">
                                                € {fascia.prezzi[z]?.toFixed(2)}
                                            </span>
                                        </div>
                                    </td>
                                ))}
                            </tr>
                        )
                    })}
                  </tbody>
               </table>
            </div>
            <p className="text-xs text-slate-400 text-center italic">
                * Anteprima limitata. Il listino salvato includerà tutte le fasce e zone.
            </p>
        </div>
      </div>
    </div>
  )
}

const PricingTable = ({ data }: { data: any }) => {
  if (!data || !data.fasce) return null;

  return (
    <div className="overflow-x-auto border rounded-lg">
      <table className="w-full text-sm text-left">
        <thead className="text-xs text-slate-700 uppercase bg-slate-50 border-b">
          <tr>
            <th className="px-4 py-3 font-bold text-slate-900 sticky left-0 bg-slate-50 z-10 shadow-[1px_0_0_0_rgba(0,0,0,0.05)]">
              Fascia Peso
            </th>
            {data.zone_coperte.map((zone: string) => (
              <th key={zone} className="px-4 py-3 whitespace-nowrap min-w-[100px]">
                {zone}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {data.fasce.map((fascia: any, idx: number) => {
            // Find min price in row to highlight
            const prices = Object.values(fascia.prezzi) as number[];
            const minPrice = prices.length > 0 ? Math.min(...prices) : 0;

            return (
              <tr key={idx} className="bg-white hover:bg-slate-50 transition-colors group">
                <td className="px-4 py-3 font-medium text-slate-900 sticky left-0 bg-white group-hover:bg-slate-50 z-10 shadow-[1px_0_0_0_rgba(0,0,0,0.05)]">
                  {fascia.peso_min} - {fascia.peso_max} kg
                </td>
                {data.zone_coperte.map((zone: string) => {
                  const price = fascia.prezzi[zone];
                  const isMin = price === minPrice && price > 0;
                  return (
                    <td key={zone} className="px-4 py-3">
                      {price ? (
                        <span className={cn(
                          "block",
                          isMin ? "font-bold text-green-700" : "text-slate-600"
                        )}>
                          € {Number(price).toFixed(2)}
                        </span>
                      ) : (
                        <span className="text-slate-300">-</span>
                      )}
                    </td>
                  )
                })}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

// --- Helpers ---

const generatePDF = (listino: ListinoCorriere) => {
  const doc = new jsPDF()
  
  // Add Logo Placeholder or Text
  doc.setFontSize(20)
  doc.setTextColor(234, 179, 8) // Yellow-500
  doc.text('Spedire Sicuro', 14, 22)
  
  doc.setFontSize(12)
  doc.setTextColor(100)
  doc.text(`Listino: ${listino.fornitore} - ${listino.servizio}`, 14, 32)
  doc.text(`Data: ${new Date(listino.created_at).toLocaleDateString('it-IT')}`, 14, 38)
  
  // Table Data
  const tableColumn = ["Fascia Peso", ...listino.zone_coperte]
  const tableRows = listino.dati_listino.fasce.map((fascia: any) => {
    const row = [`${fascia.peso_min}-${fascia.peso_max} kg`]
    listino.zone_coperte.forEach(zone => {
      const price = fascia.prezzi[zone]
      row.push(price ? `€ ${Number(price).toFixed(2)}` : '-')
    })
    return row
  })

  autoTable(doc, {
    head: [tableColumn],
    body: tableRows,
    startY: 45,
    theme: 'grid',
    headStyles: { fillColor: [234, 179, 8], textColor: 255 },
    alternateRowStyles: { fillColor: [249, 250, 251] },
  })

  doc.save(`${listino.fornitore}_${listino.servizio}_Listino.pdf`)
}

const UsageStatsBadge = ({ usageCount }: { usageCount: number }) => {
  if (usageCount === 0) return null;
  
  return (
    <div className="flex items-center gap-1 bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full text-xs border border-amber-100 shadow-sm">
      <Award className="h-3 w-3 text-amber-500" />
      <span className="font-semibold">Scelto {usageCount} volte</span>
    </div>
  )
}

const OutdatedAlert = ({ date }: { date: string }) => {
  const daysDiff = Math.floor((new Date().getTime() - new Date(date).getTime()) / (1000 * 3600 * 24));
  
  if (daysDiff < 30) return null;

  return (
    <div className="flex items-center gap-1 text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full text-xs border border-orange-100" title="Listino vecchio di oltre 30 giorni, controlla i prezzi">
      <AlertTriangle className="h-3 w-3" />
      <span className="font-medium">Obsoleto ({daysDiff}gg)</span>
    </div>
  )
}

const PriceListCard = ({ 
  listino, 
  expanded, 
  onToggle, 
  onDelete, 
  onStatusToggle 
}: { 
  listino: ListinoCorriere, 
  expanded: boolean, 
  onToggle: () => void,
  onDelete: () => void,
  onStatusToggle: () => void
}) => {
  const [showMarkup, setShowMarkup] = useState(false)
  // Mock usage stats based on ID char code sum (deterministic mock)
  const mockUsage = (listino.id.charCodeAt(0) + listino.id.charCodeAt(listino.id.length - 1)) % 150;
  
  return (
    <motion.div 
      layout 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={cn(
        "border rounded-xl shadow-sm transition-all bg-white overflow-hidden",
        expanded ? "ring-2 ring-yellow-400/50 shadow-lg" : "hover:shadow-md"
      )}
    >
      {/* Header */}
      <div className="p-5 border-b bg-gradient-to-r from-white to-slate-50/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <CarrierLogo carrier={listino.fornitore} />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-lg text-slate-800 leading-tight">{listino.fornitore}</h3>
                <UsageStatsBadge usageCount={mockUsage} />
                <OutdatedAlert date={listino.created_at} />
              </div>
              <p className="text-sm text-slate-500 font-medium">{listino.servizio}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
             <StatusBadge active={listino.attivo} />
             <Button 
               variant="ghost" 
               size="icon"
               onClick={(e) => { e.stopPropagation(); generatePDF(listino); }}
               className="text-slate-400 hover:text-blue-600 hover:bg-blue-50 hidden sm:flex"
               title="Scarica PDF"
             >
                <FileText className="h-4 w-4" />
             </Button>
             <Button 
               variant="ghost" 
               size="icon"
               onClick={(e) => { e.stopPropagation(); setShowMarkup(!showMarkup); }}
               className={cn("hidden sm:flex", showMarkup ? "text-blue-600 bg-blue-50" : "text-slate-400 hover:text-blue-600 hover:bg-blue-50")}
               title="Crea Listino Vendita"
             >
                <Calculator className="h-4 w-4" />
             </Button>
             <div className="h-8 w-px bg-slate-200 mx-1 hidden sm:block"></div>
             <Button 
               variant="ghost" 
               size="icon"
               onClick={(e) => { e.stopPropagation(); onStatusToggle(); }}
               className="text-slate-400 hover:text-slate-700 hover:bg-slate-100 hidden sm:flex"
               title={listino.attivo ? "Disattiva" : "Attiva"}
             >
                {listino.attivo ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
             </Button>
             <Button 
               variant="ghost" 
               size="icon"
               onClick={(e) => { e.stopPropagation(); onDelete(); }}
               className="text-slate-400 hover:text-red-600 hover:bg-red-50 hidden sm:flex"
               title="Elimina"
             >
                <Trash2 className="h-4 w-4" />
             </Button>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="mt-4 grid grid-cols-3 gap-4 text-sm border-t pt-4">
          <div>
            <p className="text-slate-400 text-xs uppercase font-semibold tracking-wider mb-1">Peso Max</p>
            <p className="font-medium text-slate-700 flex items-center gap-1">
              <Package className="h-3.5 w-3.5 text-slate-400" />
              {listino.peso_max} kg
            </p>
          </div>
          <div>
            <p className="text-slate-400 text-xs uppercase font-semibold tracking-wider mb-1">Zone</p>
            <p className="font-medium text-slate-700 flex items-center gap-1">
              <Box className="h-3.5 w-3.5 text-slate-400" />
              {listino.zone_coperte?.length || 0} coperte
            </p>
          </div>
          <div>
             <p className="text-slate-400 text-xs uppercase font-semibold tracking-wider mb-1">Aggiornato</p>
             <p className="font-medium text-slate-700">
               {new Date(listino.created_at).toLocaleDateString('it-IT', { month: 'short', day: 'numeric', year: 'numeric' })}
             </p>
          </div>
        </div>
      </div>
      
      {/* Markup Simulator Panel */}
      <AnimatePresence>
        {showMarkup && (
           <div className="border-b border-blue-100 bg-blue-50/30 p-4">
              <MarkupSimulator 
                listino={listino} 
                onClose={() => setShowMarkup(false)} 
                onSave={(newListino) => {
                    // Here we would normally lift state up, for now just alert
                    alert(`Listino "${newListino.servizio}" creato con successo! (Simulazione)`)
                    setShowMarkup(false)
                }}
              />
           </div>
        )}
      </AnimatePresence>

      {/* Expandable Content */}
      <AnimatePresence>
        {expanded && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }} 
            animate={{ height: 'auto', opacity: 1 }} 
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden bg-slate-50/30"
          >
            <div className="p-5">
              <div className="mb-4 flex items-center justify-between">
                 <h4 className="font-semibold text-slate-800 flex items-center gap-2">
                   <BarChart className="h-4 w-4 text-yellow-600" />
                   Tabella Prezzi
                 </h4>
                 <span className="text-xs text-slate-500 bg-white px-2 py-1 rounded border shadow-sm">
                   Tutti i prezzi sono in Euro (€)
                 </span>
              </div>
              <PricingTable data={listino.dati_listino} />
              
              {/* Mobile actions that appear only when expanded */}
              <div className="mt-6 flex gap-3 sm:hidden border-t pt-4">
                 <Button 
                   variant="outline" 
                   className="flex-1"
                   onClick={onStatusToggle}
                 >
                   {listino.attivo ? 'Disattiva' : 'Attiva'}
                 </Button>
                 <Button 
                   variant="destructive" 
                   className="flex-1"
                   onClick={onDelete}
                 >
                   Elimina
                 </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <Button 
        variant="ghost" 
        onClick={onToggle} 
        className={cn(
          "w-full rounded-t-none border-t bg-slate-50 hover:bg-slate-100 text-slate-500 h-10 text-xs uppercase tracking-widest font-semibold transition-colors",
          expanded && "bg-yellow-50 hover:bg-yellow-100 text-yellow-700 border-yellow-200"
        )}
      >
         {expanded ? 'Nascondi Dettagli' : 'Vedi Dettagli'}
         <ChevronDown className={cn("ml-2 h-4 w-4 transition-transform duration-300", expanded && "rotate-180")} />
      </Button>
    </motion.div>
  )
}

// --- Main Component ---

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
        setShowUpload(false)
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
      // Optimistic update
      setListini(prev => prev.map(l => l.id === id ? { ...l, attivo: !attivo } : l))

      const res = await fetch('/api/listini', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, attivo: !attivo }),
      })

      const data = await res.json()
      if (!data.success) {
        // Revert on error
        setListini(prev => prev.map(l => l.id === id ? { ...l, attivo: attivo } : l))
        alert(`Errore: ${data.error}`)
      }
    } catch (error: any) {
      setListini(prev => prev.map(l => l.id === id ? { ...l, attivo: attivo } : l))
      alert(`Errore: ${error.message}`)
    }
  }

  const deleteListino = async (id: string) => {
    if (!confirm('Sei sicuro di voler eliminare questo listino?')) return

    try {
      // Optimistic remove
      const originalList = [...listini]
      setListini(prev => prev.filter(l => l.id !== id))

      const res = await fetch(`/api/listini?id=${id}`, {
        method: 'DELETE',
      })

      const data = await res.json()
      if (!data.success) {
        setListini(originalList)
        alert(`Errore: ${data.error}`)
      }
    } catch (error: any) {
      alert(`Errore: ${error.message}`)
    }
  }

  const filteredListini = useMemo(() => {
    return listini.filter(l => 
      l.fornitore.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.servizio.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [listini, searchTerm])

  return (
    <div className="space-y-8">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-xl shadow-sm border border-slate-100">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input 
            placeholder="Cerca per fornitore o servizio..." 
            className="pl-10 bg-slate-50 border-slate-200 focus:bg-white transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
           <Button 
             variant={showUpload ? "secondary" : "default"}
             onClick={() => setShowUpload(!showUpload)}
             className={cn(
               "transition-all shadow-lg shadow-yellow-500/20", 
               !showUpload ? "bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-600 hover:to-amber-700 text-white border-0" : ""
             )}
           >
             {showUpload ? (
               <>Chiudi Upload</>
             ) : (
               <><Plus className="mr-2 h-4 w-4" /> Nuovo Listino</>
             )}
           </Button>
        </div>
      </div>

      {/* Upload Section (Collapsible) */}
      <AnimatePresence>
        {showUpload && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <Card className="border-dashed border-2 border-yellow-400/50 bg-yellow-50/30 shadow-none">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Upload className="h-5 w-5 text-yellow-600" />
                  Upload Listino
                </CardTitle>
                <CardDescription>Supporta file CSV e Excel. Assicurati che le colonne delle zone siano corrette.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-semibold text-slate-700 mb-1.5 block">Fornitore</label>
                    <Input
                      placeholder="Es: DHL, GLS, BRT..."
                      value={fornitore}
                      onChange={(e) => setFornitore(e.target.value)}
                      className="bg-white"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-slate-700 mb-1.5 block">Nome Servizio</label>
                    <Input
                      placeholder="Es: Express 24h, Economy..."
                      value={servizio}
                      onChange={(e) => setServizio(e.target.value)}
                      className="bg-white"
                    />
                  </div>
                </div>
                <div>
                   <label className="text-sm font-semibold text-slate-700 mb-1.5 block">File Listino</label>
                   <div className="border-2 border-dashed border-slate-200 rounded-lg p-8 bg-white hover:bg-slate-50 transition-colors text-center cursor-pointer relative">
                      <Input
                        type="file"
                        accept=".csv,.xlsx,.xls"
                        onChange={(e) => setFile(e.target.files?.[0] || null)}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                      <div className="pointer-events-none">
                        <Upload className="mx-auto h-8 w-8 text-slate-300 mb-2" />
                        <p className="text-sm font-medium text-slate-600">
                          {file ? file.name : "Clicca o trascina il file qui"}
                        </p>
                        <p className="text-xs text-slate-400 mt-1">Max 10MB (CSV, XLSX)</p>
                      </div>
                   </div>
                </div>
                <div className="flex justify-end pt-2">
                   <Button
                    onClick={handleUpload}
                    disabled={uploading || !file || !fornitore || !servizio}
                    className="bg-yellow-600 hover:bg-yellow-700 text-white min-w-[150px]"
                   >
                    {uploading ? (
                      <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Caricamento...</>
                    ) : (
                      "Carica e Salva"
                    )}
                   </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Listini Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-12 text-slate-400">
          <Loader2 className="h-10 w-10 animate-spin mb-4 text-yellow-500" />
          <p>Caricamento listini in corso...</p>
        </div>
      ) : filteredListini.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-dashed border-slate-200">
          <div className="bg-slate-50 h-20 w-20 rounded-full flex items-center justify-center mx-auto mb-4">
             <Package className="h-10 w-10 text-slate-300" />
          </div>
          <h3 className="text-lg font-bold text-slate-800">Nessun listino trovato</h3>
          <p className="text-slate-500 max-w-sm mx-auto mt-2">
            Non ci sono ancora listini caricati o la ricerca non ha prodotto risultati.
          </p>
          <Button 
            variant="link" 
            className="text-yellow-600 mt-4" 
            onClick={() => setShowUpload(true)}
          >
            Carica il primo listino
          </Button>
        </div>
      ) : (
        <div className="grid gap-6">
          <AnimatePresence>
            {filteredListini.map((listino) => (
              <PriceListCard
                key={listino.id}
                listino={listino}
                expanded={expandedId === listino.id}
                onToggle={() => setExpandedId(expandedId === listino.id ? null : listino.id)}
                onDelete={() => deleteListino(listino.id)}
                onStatusToggle={() => toggleAttivo(listino.id, listino.attivo)}
              />
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}
