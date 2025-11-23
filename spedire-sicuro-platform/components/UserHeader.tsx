'use client'

import { Button } from '@/components/ui/button'
import { useAuth } from '@/components/providers/auth-provider'
import { LogOut, User as UserIcon } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

export function UserHeader() {
  const { user, signOut } = useAuth()

  if (!user) return null

  return (
    <div className="mb-8 flex items-center justify-between bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/20 shadow-lg">
      <div className="flex items-center gap-4">
        <Link href="/dashboard" className="flex items-center gap-4 hover:opacity-80 transition-opacity">
          <Image src="/logo.jpg" alt="Spedire Sicuro" width={50} height={50} className="rounded-full border-2 border-white/50" />
          <div>
            <h1 className="text-xl font-bold text-white">Spedire Sicuro</h1>
            <div className="flex items-center text-yellow-300 text-sm">
              <UserIcon className="h-3 w-3 mr-1" />
              {user.email}
            </div>
          </div>
        </Link>
      </div>
      
      <div className="flex gap-3">
        <Link href="/listini">
          <Button variant="ghost" className="text-white hover:bg-white/20 hover:text-yellow-200">
            📋 Listini
          </Button>
        </Link>
        <Link href="/dashboard">
          <Button variant="ghost" className="text-white hover:bg-white/20 hover:text-yellow-200">
            📷 OCR Dashboard
          </Button>
        </Link>
        <div className="h-9 w-px bg-white/20 mx-1"></div>
        <Button 
          variant="destructive" 
          onClick={signOut}
          className="bg-red-500/80 hover:bg-red-600 border border-red-400/50"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Esci
        </Button>
      </div>
    </div>
  )
}
