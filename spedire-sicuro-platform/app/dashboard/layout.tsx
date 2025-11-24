'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Image from 'next/image'
import { 
  LayoutDashboard, 
  Camera, 
  FileText, 
  BarChart3, 
  Settings, 
  LogOut, 
  Menu, 
  X,
  PackagePlus,
  List,
  Mail,
  Zap
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/components/providers/auth-provider'
import { cn } from '@/lib/utils'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const pathname = usePathname()
  const { user, signOut } = useAuth()

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Crea Spedizione', href: '/dashboard/crea-spedizione', icon: PackagePlus },
    { name: 'Lista Spedizioni', href: '/dashboard/spedizioni', icon: List },
    { name: 'Analizza OCR', href: '/dashboard/ocr', icon: Camera },
    { name: 'Gestione Posta', href: '/dashboard/admin/postale', icon: Mail },
    { name: 'Automation Agent', href: '/dashboard/automation', icon: Zap },
    { name: 'Listini', href: '/listini', icon: FileText },
    { name: 'Report', href: '/dashboard/reports', icon: BarChart3, disabled: true },
    { name: 'Impostazioni', href: '/dashboard/settings', icon: Settings, disabled: true },
  ]

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Mobile Header */}
      <div className="lg:hidden bg-white border-b p-4 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <Image src="/logo.jpg" alt="Logo" width={32} height={32} className="rounded-full" />
          <span className="font-bold text-slate-900">Spedire Sicuro</span>
        </div>
        <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
          {isSidebarOpen ? <X /> : <Menu />}
        </Button>
      </div>

      <div className="flex h-screen overflow-hidden">
        {/* Sidebar */}
        <aside className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-slate-200 transform transition-transform duration-300 lg:translate-x-0 lg:static lg:h-auto",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}>
          <div className="h-full flex flex-col">
            {/* Sidebar Header */}
            <div className="p-6 border-b border-slate-100 hidden lg:flex items-center gap-3">
              <Image src="/logo.jpg" alt="Logo" width={40} height={40} className="rounded-full shadow-sm" />
              <div>
                <h1 className="font-bold text-lg text-slate-900 leading-none">Spedire Sicuro</h1>
                <p className="text-xs text-slate-500 mt-1">Enterprise Platform</p>
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
              {navigation.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.name}
                    href={item.disabled ? '#' : item.href}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                      isActive 
                        ? "bg-yellow-50 text-yellow-700 shadow-sm" 
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900",
                      item.disabled && "opacity-50 cursor-not-allowed hover:bg-transparent"
                    )}
                    onClick={() => setIsSidebarOpen(false)}
                  >
                    <item.icon className={cn("h-5 w-5", isActive ? "text-yellow-600" : "text-slate-400")} />
                    {item.name}
                    {item.disabled && <span className="ml-auto text-[10px] font-bold bg-slate-100 px-1.5 py-0.5 rounded text-slate-400">PRESTO</span>}
                  </Link>
                )
              })}
            </nav>

            {/* User Footer */}
            <div className="p-4 border-t border-slate-100 bg-slate-50/50">
              <div className="flex items-center gap-3 mb-4 px-2">
                <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-700 font-bold border border-yellow-200">
                  {user?.email?.[0].toUpperCase()}
                </div>
                <div className="overflow-hidden">
                  <p className="text-sm font-medium text-slate-900 truncate">{user?.email}</p>
                  <p className="text-xs text-slate-500 truncate">Amministratore</p>
                </div>
              </div>
              <Button 
                variant="outline" 
                className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 border-red-100"
                onClick={() => signOut()}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Esci
              </Button>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto bg-slate-50 scroll-smooth">
          <div className="container mx-auto max-w-7xl p-4 lg:p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
