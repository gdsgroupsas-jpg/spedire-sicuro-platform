// app/dashboard/automation/page.tsx
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Settings, PlusCircle, Zap, TrendingUp, Shield } from 'lucide-react';

export default function AutomationAgentPage() {
  const rules = [
    {
      id: 1,
      trigger: 'Nuova Spedizione OCR (Entrata)',
      condition: 'Margine > 35% AND Provincia = NA',
      action: 'Assegna a Corriere PRIME (Ottimizzazione Profitto)',
      status: 'Attiva',
      severity: 'info',
      icon: TrendingUp,
    },
    {
      id: 2,
      trigger: 'Validazione Indirizzo',
      condition: 'Geo-Status = Errore (Google non risolve)',
      action: 'Blocca Spedizione e Crea Task di Revisione',
      status: 'Attiva',
      severity: 'critical',
      icon: Shield,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
          <Zap className="w-7 h-7 text-yellow-600" /> Automation Agent
        </h1>
        <Button className="bg-green-600 hover:bg-green-700">
          <PlusCircle className="w-4 h-4 mr-2" /> Nuova Regola
        </Button>
      </div>
      
      <p className="text-slate-500">
        Trasforma i dati estratti in azioni automatiche. Regole "SE... ALLORA..." basate su destinazione, profitto e stato Geo-Marketing.
      </p>

      <Card>
        <CardHeader>
          <CardTitle>Motore di Regole Attive ({rules.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {rules.map((rule) => (
              <div 
                key={rule.id} 
                className="flex justify-between items-center p-4 rounded-lg border bg-white shadow-sm"
              >
                <div className="flex items-center">
                    <rule.icon className={`w-5 h-5 mr-3 ${rule.severity === 'critical' ? 'text-red-500' : 'text-blue-500'}`} />
                    <div>
                        <p className="font-semibold text-slate-900">{rule.trigger}</p>
                        <p className="text-sm text-slate-600">Condizione: <span className="font-medium">{rule.condition}</span></p>
                        <p className="text-xs text-slate-500">Azione: {rule.action}</p>
                    </div>
                </div>
                <span className={`text-xs font-bold px-3 py-1 rounded-full bg-green-100 text-green-700`}>
                  {rule.status}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
