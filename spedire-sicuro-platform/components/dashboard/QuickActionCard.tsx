import Link from 'next/link'
import { LucideIcon, ArrowRight } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface QuickActionCardProps {
  title: string
  description: string
  icon: LucideIcon
  href: string
  color?: string
  buttonText?: string
}

export function QuickActionCard({ 
  title, 
  description, 
  icon: Icon, 
  href, 
  color = "bg-blue-50 text-blue-600",
  buttonText = "Apri"
}: QuickActionCardProps) {
  return (
    <Link href={href} className="block group h-full">
      <Card className="h-full hover:shadow-lg transition-all duration-300 border-slate-100 group-hover:border-yellow-200">
        <CardContent className="p-6 flex flex-col h-full">
          <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110", color)}>
            <Icon className="h-6 w-6" />
          </div>
          
          <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-yellow-600 transition-colors">
            {title}
          </h3>
          <p className="text-sm text-slate-500 mb-6 flex-grow">
            {description}
          </p>
          
          <div className="flex items-center text-sm font-semibold text-slate-900 group-hover:text-yellow-600">
            {buttonText}
            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
