import { LucideIcon } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface StatCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  trend?: string
  trendUp?: boolean
  description?: string
  loading?: boolean
}

export function StatCard({ title, value, icon: Icon, trend, trendUp, description, loading }: StatCardProps) {
  if (loading) {
    return (
      <Card className="animate-pulse">
        <CardContent className="p-6">
          <div className="h-10 w-10 bg-slate-100 rounded-full mb-4"></div>
          <div className="h-4 w-24 bg-slate-100 rounded mb-2"></div>
          <div className="h-8 w-16 bg-slate-100 rounded"></div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="hover:shadow-md transition-all duration-300 border-slate-100 overflow-hidden relative">
      <div className="absolute top-0 right-0 p-4 opacity-10">
        <Icon className="h-24 w-24 text-yellow-500" />
      </div>
      <CardContent className="p-6 relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="p-3 bg-yellow-50 rounded-xl">
            <Icon className="h-6 w-6 text-yellow-600" />
          </div>
          {trend && (
            <span className={cn(
              "text-xs font-bold px-2 py-1 rounded-full flex items-center",
              trendUp ? "text-green-600 bg-green-50" : "text-red-600 bg-red-50"
            )}>
              {trendUp ? '↑' : '↓'} {trend}
            </span>
          )}
        </div>
        
        <div className="space-y-1">
          <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wide">{title}</h3>
          <div className="text-3xl font-bold text-slate-900">{value}</div>
          {description && (
            <p className="text-xs text-slate-400">{description}</p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
