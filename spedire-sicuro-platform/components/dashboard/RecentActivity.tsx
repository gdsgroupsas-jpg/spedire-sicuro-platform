import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Package, Truck, ArrowRight, CalendarClock } from 'lucide-react'
import Link from 'next/link'

interface Activity {
  id: string
  created_at: string
  destinatario: string
  localita: string
  provincia: string
  corriere_scelto?: string
  prezzo_finale?: number
}

interface RecentActivityProps {
  activities: Activity[]
  loading?: boolean
}

export function RecentActivity({ activities, loading }: RecentActivityProps) {
  if (loading) {
    return (
      <Card className="h-full">
        <CardHeader>
          <div className="h-6 w-40 bg-slate-100 rounded mb-2"></div>
        </CardHeader>
        <CardContent>
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-4 py-4 border-b border-slate-50">
              <div className="h-10 w-10 bg-slate-100 rounded-full"></div>
              <div className="flex-1">
                <div className="h-4 w-32 bg-slate-100 rounded mb-2"></div>
                <div className="h-3 w-20 bg-slate-100 rounded"></div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="h-full border-slate-100 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
          <CalendarClock className="h-5 w-5 text-yellow-500" />
          Attività Recente
        </CardTitle>
        <Link href="/dashboard/history" className="text-xs font-medium text-blue-600 hover:underline flex items-center">
          Vedi tutto <ArrowRight className="ml-1 h-3 w-3" />
        </Link>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <div className="text-center py-10 text-slate-400">
            <Package className="h-10 w-10 mx-auto mb-2 opacity-20" />
            <p>Nessuna spedizione recente</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {activities.map((activity) => (
              <div key={activity.id} className="py-4 flex items-center justify-between hover:bg-slate-50 px-2 rounded-lg transition-colors -mx-2">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                    <Package className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">{activity.destinatario}</p>
                    <div className="flex items-center text-xs text-slate-500 gap-2">
                      <span>{activity.localita} ({activity.provincia})</span>
                      <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                      <span>{new Date(activity.created_at).toLocaleDateString('it-IT')}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  {activity.prezzo_finale ? (
                    <p className="font-bold text-slate-900">€{activity.prezzo_finale}</p>
                  ) : (
                    <p className="text-xs text-slate-400 italic">In bozza</p>
                  )}
                  {activity.corriere_scelto && (
                    <p className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full inline-block mt-1">
                      {activity.corriere_scelto}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
