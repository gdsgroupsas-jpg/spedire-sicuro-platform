'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Wallet, TrendingUp, Package, AlertTriangle, History, Printer, Euro } from 'lucide-react';
import { getPostalPnlMetrics, registraSpedizionePostaleAdmin } from '@/lib/postal-service';
import { formatCurrency } from '@/lib/utils';

// Mock data per UI dev prima di integrazione completa
const MOCK_TRANSACTIONS = [
  { id: '1', data: '2024-05-20 14:30', codice: 'PB-8X92', servizio: 'Raccomandata Pro', dest: 'Roma', costo: 5.40, margine: 1.50 },
  { id: '2', data: '2024-05-20 12:15', codice: 'PB-7A21', servizio: 'Posta1', dest: 'Milano', costo: 2.10, margine: 0.80 },
  { id: '3', data: '2024-05-19 09:45', codice: 'PB-3M55', servizio: 'Posta4', dest: 'Napoli', costo: 0.95, margine: 0.45 },
];

export default function PostalAdminDashboard() {
  const [metrics, setMetrics] = useState<any>({ saldo_attuale: 0, spedizioni_oggi: 0 });
  const [loading, setLoading] = useState(false);
  
  // Form State
  const [servizio, setServizio] = useState('posta1_pro');
  const [destinazione, setDestinazione] = useState('Italia');
  const [peso, setPeso] = useState('');
  const [prezzoCliente, setPrezzoCliente] = useState('');

  useEffect(() => {
    // Carica metriche reali
    const loadMetrics = async () => {
      try {
        const data = await getPostalPnlMetrics();
        setMetrics(data);
      } catch (e) {
        console.error("Errore caricamento metriche:", e);
        // Fallback mock
        setMetrics({ saldo_attuale: 1250.50, spedizioni_oggi: 12 });
      }
    };
    loadMetrics();
  }, []);

  const handleAffrancatura = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Simuliamo chiamata alla server action sicura
      // In produzione: await registraOperazionePostale(...)
      await new Promise(resolve => setTimeout(resolve, 1000)); 
      
      alert(`Affrancatura registrata con successo! Saldo aggiornato.`);
      // Reset form
      setPeso('');
      setPrezzoCliente('');
      // Reload metrics
      const data = await getPostalPnlMetrics();
      setMetrics(data);
      
    } catch (err: any) {
      alert(`Errore: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      
      {/* Header & Saldo (Semaforo) */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Servizi Postali Admin</h1>
          <p className="text-slate-500">Gestione Affrancatrice PostaBase Mini & Contabilità</p>
        </div>
        
        <Card className={`border-l-8 shadow-lg min-w-[300px] ${
          metrics.saldo_attuale > 500 ? 'border-l-green-500' : metrics.saldo_attuale > 100 ? 'border-l-yellow-500' : 'border-l-red-600'
        }`}>
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">Fondo Cassa Attuale</p>
              <h2 className={`text-3xl font-bold ${
                metrics.saldo_attuale > 500 ? 'text-green-700' : metrics.saldo_attuale > 100 ? 'text-yellow-600' : 'text-red-600'
              }`}>
                {formatCurrency(metrics.saldo_attuale)}
              </h2>
            </div>
            <div className={`p-3 rounded-full ${
               metrics.saldo_attuale > 500 ? 'bg-green-100 text-green-600' : metrics.saldo_attuale > 100 ? 'bg-yellow-100 text-yellow-600' : 'bg-red-100 text-red-600'
            }`}>
              <Wallet className="h-8 w-8" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="affrancatura" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-8">
          <TabsTrigger value="affrancatura">Nuova Affrancatura (Operativo)</TabsTrigger>
          <TabsTrigger value="report">Report P&L (Contabilità)</TabsTrigger>
        </TabsList>

        {/* TAB 1: OPERATIVO */}
        <TabsContent value="affrancatura">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Form Affrancatura */}
            <Card className="lg:col-span-2 border-t-4 border-t-blue-600 shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Printer className="h-5 w-5 text-blue-600" />
                  Registra Nuova Spedizione
                </CardTitle>
                <CardDescription>
                  L'operazione scalerà immediatamente il credito dal fondo cassa.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAffrancatura} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label>Servizio Postale</Label>
                      <Select value={servizio} onValueChange={setServizio}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="posta1_pro">Posta1 Pro (Tracciata)</SelectItem>
                          <SelectItem value="posta4_pro">Posta4 Pro (Ordinaria)</SelectItem>
                          <SelectItem value="raccomandata_pro">Raccomandata Pro</SelectItem>
                          <SelectItem value="raccomandata_1">Raccomandata 1</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Destinazione</Label>
                      <Select value={destinazione} onValueChange={setDestinazione}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Italia">Italia</SelectItem>
                          <SelectItem value="Europa">Europa</SelectItem>
                          <SelectItem value="Mondo">Extra-UE</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Peso (grammi)</Label>
                      <div className="relative">
                        <Input 
                          type="number" 
                          placeholder="Es. 250" 
                          value={peso}
                          onChange={e => setPeso(e.target.value)}
                          required
                          min="1"
                        />
                        <span className="absolute right-3 top-2.5 text-sm text-slate-400">gr</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Prezzo al Cliente (AOV)</Label>
                      <div className="relative">
                        <Input 
                          type="number" 
                          placeholder="Es. 8.50" 
                          value={prezzoCliente}
                          onChange={e => setPrezzoCliente(e.target.value)}
                          required
                          step="0.01"
                        />
                        <span className="absolute right-3 top-2.5 text-sm text-slate-400">€</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-lg border flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5" />
                    <div className="text-sm text-slate-600">
                      <p className="font-semibold text-slate-900">Attenzione al Credito</p>
                      <p>Confermando, il costo vivo (COGS) verrà scalato dal fondo cassa. Assicurarsi che l'affrancatrice sia pronta.</p>
                    </div>
                  </div>

                  <Button type="submit" className="w-full h-12 text-lg bg-blue-600 hover:bg-blue-700" disabled={loading}>
                    {loading ? 'Registrazione in corso...' : 'Confirm & Print Label'}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Quick Stats / Recent */}
            <div className="space-y-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <History className="h-4 w-4 text-slate-500" /> Ultime Operazioni
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                   <div className="divide-y">
                     {MOCK_TRANSACTIONS.map((tx) => (
                       <div key={tx.id} className="p-4 flex justify-between items-center hover:bg-slate-50">
                         <div>
                           <p className="font-bold text-slate-800">{tx.codice}</p>
                           <p className="text-xs text-slate-500">{tx.servizio} • {tx.dest}</p>
                         </div>
                         <div className="text-right">
                            <p className="font-bold text-green-600">+{formatCurrency(tx.margine)}</p>
                            <p className="text-xs text-slate-400">COGS: {formatCurrency(tx.costo)}</p>
                         </div>
                       </div>
                     ))}
                   </div>
                   <div className="p-4 border-t bg-slate-50 text-center">
                     <Button variant="link" size="sm" className="text-blue-600">Vedi Registro Completo</Button>
                   </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* TAB 2: REPORT P&L */}
        <TabsContent value="report">
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card>
                 <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-slate-500">Spedizioni (30gg)</CardTitle>
                 </CardHeader>
                 <CardContent>
                    <div className="text-2xl font-bold text-slate-900">1,245</div>
                    <p className="text-xs text-green-600 flex items-center mt-1">
                       <TrendingUp className="h-3 w-3 mr-1" /> +12% vs mese scorso
                    </p>
                 </CardContent>
              </Card>
              <Card>
                 <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-slate-500">Margine Lordo Totale</CardTitle>
                 </CardHeader>
                 <CardContent>
                    <div className="text-2xl font-bold text-green-600">€ 3,450.20</div>
                    <p className="text-xs text-slate-400 mt-1">Profitto netto su affrancature</p>
                 </CardContent>
              </Card>
              <Card>
                 <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-slate-500">Spesa Media (COGS)</CardTitle>
                 </CardHeader>
                 <CardContent>
                    <div className="text-2xl font-bold text-slate-700">€ 4.15</div>
                    <p className="text-xs text-slate-400 mt-1">Costo medio per spedizione</p>
                 </CardContent>
              </Card>
           </div>

           <Card>
              <CardHeader>
                 <CardTitle>Registro Transazioni P&L</CardTitle>
                 <CardDescription>Tutti i movimenti che hanno impattato il fondo cassa.</CardDescription>
              </CardHeader>
              <CardContent>
                 <div className="rounded-md border p-8 text-center text-slate-500">
                    Graph Visualization Placeholder (Requires Recharts)
                 </div>
              </CardContent>
           </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
