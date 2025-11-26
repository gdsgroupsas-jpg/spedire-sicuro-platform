import { UserHeader } from '@/components/UserHeader'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto max-w-7xl px-4 py-6">
        {/* User Header */}
        <UserHeader />
        
        {/* Dashboard Content */}
        <main className="mt-6">
          {children}
        </main>
      </div>
    </div>
  )
}
