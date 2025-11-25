'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase-browser'
import { StatCard } from '@/components/dashboard/StatCard'
import { QuickActionCard } from '@/components/dashboard/QuickActionCard'
import { RecentActivity } from '@/components/dashboard/RecentActivity'
import { OpportunityMap } from '@/components/dashboard/OpportunityMap'
import {
  Package,
  PiggyBank,
  FileText,
  Timer,
  Camera,
  Truck,
  BarChart3,
  Settings,
  Target
} from 'lucide-react'

export default function DashboardOverview() {
  const [stats, setStats] = useState({
    totalShipments: 0,
    totalSavings: 0,
    activeLists: 0,
    avgTime: '0s'
  })
  const [recentActivity, setRecentActivity] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true)
      try {
        // 1. Fetch Stats
        const { count: shipmentsCount } = await supabase
          .from('spedizioni')
          .select('*', { count: 'exact', head: true })

        const { count: listsCount } = await supabase
          .from('listini_corrieri')
          .select('*', { count: 'exact', head: true })
          .eq('attivo', true)

        // Mock calc for savings (in real app this comes from DB)
        const totalSavings = (shipmentsCount || 0) * 4.50 

        // 2. Fetch Recent Activity
        const { data: activity } = await supabase
          .from('spedizioni')
          .select('id, created_at, destinatario, localita, provincia, corriere_scelto, prezzo_finale')
          .order('created_at', { ascending: false })
          .limit(5)

        setStats({
          totalShipments: shipmentsCount || 0,
          totalSavings: totalSavings,
          activeLists: listsCount || 0,
          avgTime: '12s' // Mock for now
        })
        setRecentActivity(activity || [])
      } catch (error) {
        console.error('Error loading dashboard:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Panoramica</h1>
          <p className="text-slate-500">Bentornato! Ecco cosa sta succedendo oggi.</p>
        </div>
        <div className="text-sm text-slate-500 bg-white px-4 py-2 rounded-full border shadow-sm">
          {new Date().toLocaleDateString('it-IT', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Spedizioni Totali" 
          value={stats.totalShipments} 
          icon={Package} 
          trend="12%" 
          trendUp={true}
          loading={loading}
        />
        <StatCard 
          title="Risparmio Generato" 
          value={`€${stats.totalSavings.toFixed(2)}`} 
          icon={PiggyBank} 
          trend="8%" 
          trendUp={true}
          loading={loading}
        />
        <StatCard 
          title="Listini Attivi" 
          value={stats.activeLists} 
          icon={FileText} 
          description="Su 12 totali caricati"
          loading={loading}
        />
        <StatCard 
          title="Tempo Medio" 
          value={stats.avgTime} 
          icon={Timer} 
          description="Per elaborazione OCR"
          loading={loading}
        />
      </div>

      {/* Geointelligence Map */}
      <OpportunityMap />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Quick Actions (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-lg font-bold text-slate-900">Azioni Rapide</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <QuickActionCard 
              title="Analizza Screenshot"
              description="Carica uno screenshot WhatsApp o email per estrarre i dati automaticamente."
              icon={Camera}
              href="/dashboard/ocr"
              buttonText="Inizia OCR"
              color="bg-blue-50 text-blue-600"
            />
            <QuickActionCard 
              title="Gestisci Listini"
              description="Carica, aggiorna o modifica i listini dei tuoi corrieri."
              icon={Truck}
              href="/listini"
              buttonText="Vedi Listini"
              color="bg-green-50 text-green-600"
            />
            <QuickActionCard
              title="Pianificazione Strategica"
              description="Gestisci mission, vision, SWOT, canvas e budget media."
              icon={Target}
              href="/dashboard/strategy"
              buttonText="Vai alla Strategia"
              color="bg-orange-50 text-orange-600"
            />
            <QuickActionCard
              title="Report Avanzati"
              description="Analizza le performance e i margini delle tue spedizioni."
              icon={BarChart3}
              href="/dashboard/reports"
              buttonText="Vedi Statistiche"
              color="bg-purple-50 text-purple-600"
            />
            <QuickActionCard
              title="Impostazioni"
              description="Configura il tuo profilo e le preferenze di sistema."
              icon={Settings}
              href="/dashboard/settings"
              buttonText="Configura"
              color="bg-slate-100 text-slate-600"
            />
          </div>
        </div>

        {/* Recent Activity (1 col) */}
        <div className="lg:col-span-1">
          <RecentActivity activities={recentActivity} loading={loading} />
        </div>
      </div>
    </div>
  )
}
