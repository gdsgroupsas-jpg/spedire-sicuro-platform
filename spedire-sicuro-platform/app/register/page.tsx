'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase-browser'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Loader2, UserPlus, AlertCircle, CheckCircle2, XCircle } from 'lucide-react'

export default function RegisterPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [acceptTerms, setAcceptTerms] = useState(false)
  
  const router = useRouter()
  const supabase = createClient()

  // Password strength checks
  const hasMinLength = password.length >= 8
  const hasNumber = /\d/.test(password)
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password)
  
  const isPasswordValid = hasMinLength && hasNumber && hasSpecialChar
  const passwordsMatch = password === confirmPassword && password !== ''

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!isPasswordValid) {
      setError('La password non soddisfa i requisiti di sicurezza')
      return
    }

    if (!passwordsMatch) {
      setError('Le password non coincidono')
      return
    }

    if (!acceptTerms) {
      setError('Devi accettare i termini di servizio')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${location.origin}/auth/callback`,
        },
      })

      if (error) {
        throw error
      }

      setSuccess(true)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-500 via-yellow-600 to-green-700 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-2xl bg-white/95 backdrop-blur">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-green-700">Registrazione Completata!</CardTitle>
            <CardDescription className="text-lg pt-2">
              Controlla la tua email per confermare l'account prima di accedere.
            </CardDescription>
          </CardHeader>
          <CardFooter className="justify-center p-6">
            <Link href="/login">
              <Button className="w-full bg-green-600 hover:bg-green-700">
                Vai al Login
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-500 via-yellow-600 to-green-700 flex items-center justify-center p-4 py-8">
      <Card className="w-full max-w-md shadow-2xl bg-white/95 backdrop-blur">
        <CardHeader className="space-y-2 text-center">
          <div className="flex justify-center mb-4">
             <div className="relative w-16 h-16 rounded-full overflow-hidden border-4 border-yellow-500 shadow-lg">
               <Image 
                 src="/logo.jpg" 
                 alt="Spedire Sicuro" 
                 fill
                 className="object-cover"
               />
             </div>
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">Crea un Account</CardTitle>
          <CardDescription>
            Registrati per iniziare a gestire le tue spedizioni
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleRegister} className="space-y-4">
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
              
              {/* Password Requirements */}
              <div className="grid grid-cols-2 gap-2 mt-2 text-xs text-gray-500">
                <div className={`flex items-center gap-1 ${hasMinLength ? 'text-green-600' : ''}`}>
                  {hasMinLength ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />} Min 8 caratteri
                </div>
                <div className={`flex items-center gap-1 ${hasNumber ? 'text-green-600' : ''}`}>
                  {hasNumber ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />} Un numero
                </div>
                <div className={`flex items-center gap-1 ${hasSpecialChar ? 'text-green-600' : ''}`}>
                  {hasSpecialChar ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />} Carattere spec.
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700" htmlFor="confirmPassword">
                Conferma Password
              </label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className={`border-gray-300 ${confirmPassword && !passwordsMatch ? 'border-red-500' : ''}`}
              />
              {confirmPassword && !passwordsMatch && (
                <p className="text-xs text-red-500">Le password non coincidono</p>
              )}
            </div>

            <div className="flex items-center space-x-2 pt-2">
              <input
                type="checkbox"
                id="terms"
                className="h-4 w-4 rounded border-gray-300 text-yellow-600 focus:ring-yellow-500"
                checked={acceptTerms}
                onChange={(e) => setAcceptTerms(e.target.checked)}
              />
              <label htmlFor="terms" className="text-sm text-gray-600 leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Accetto i termini e le condizioni del servizio
              </label>
            </div>

            <Button 
              type="submit" 
              className="w-full bg-yellow-600 hover:bg-yellow-700 text-white font-semibold transition-colors mt-4"
              disabled={loading || !isPasswordValid || !passwordsMatch || !acceptTerms}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Registrazione...
                </>
              ) : (
                <>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Registrati
                </>
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="justify-center border-t p-4 bg-gray-50 rounded-b-xl">
          <p className="text-sm text-gray-600">
            Hai già un account?{' '}
            <Link href="/login" className="text-yellow-700 hover:underline font-semibold">
              Accedi qui
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
