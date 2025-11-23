'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase-browser'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Loader2, LogIn, AlertCircle } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        throw error
      }

      router.push('/dashboard')
      router.refresh()
    } catch (err: any) {
      setError(err.message === 'Invalid login credentials' 
        ? 'Email o password non corretti' 
        : err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-500 via-yellow-600 to-green-700 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-2xl bg-white/95 backdrop-blur">
        <CardHeader className="space-y-2 text-center">
          <div className="flex justify-center mb-4">
             <div className="relative w-20 h-20 rounded-full overflow-hidden border-4 border-yellow-500 shadow-lg">
               <Image 
                 src="/logo.jpg" 
                 alt="Spedire Sicuro" 
                 fill
                 className="object-cover"
               />
             </div>
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">Accedi alla Piattaforma</CardTitle>
          <CardDescription>
            Inserisci le tue credenziali per gestire le spedizioni
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm flex items-center gap-2 border border-red-200">
                <AlertCircle className="h-4 w-4" />
                {error}
              </div>
            )}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700" htmlFor="email">
                Email
              </label>
              <Input
                id="email"
                type="email"
                placeholder="nome@azienda.it"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="border-gray-300"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700" htmlFor="password">
                Password
              </label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="border-gray-300"
              />
            </div>
            <Button 
              type="submit" 
              className="w-full bg-yellow-600 hover:bg-yellow-700 text-white font-semibold transition-colors"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Accesso in corso...
                </>
              ) : (
                <>
                  <LogIn className="mr-2 h-4 w-4" />
                  Accedi
                </>
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="justify-center border-t p-4 bg-gray-50 rounded-b-xl">
          <p className="text-sm text-gray-600">
            Non hai un account?{' '}
            <Link href="/register" className="text-yellow-700 hover:underline font-semibold">
              Registrati qui
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
