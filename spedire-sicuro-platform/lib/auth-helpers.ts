import { NextRequest, NextResponse } from 'next/server'
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { SupabaseClient } from '@supabase/supabase-js'

/**
 * Verifica che l'utente sia autenticato
 * @returns User object se autenticato, null altrimenti
 */
export async function getAuthenticatedUser(request?: NextRequest) {
  try {
    const cookieStore = cookies()

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
          set(name: string, value: string, options: CookieOptions) {
            try {
              cookieStore.set({ name, value, ...options })
            } catch (error) {
              // Ignora errori di set in Server Components
            }
          },
          remove(name: string, options: CookieOptions) {
            try {
              cookieStore.set({ name, value: '', ...options })
            } catch (error) {
              // Ignora errori di remove in Server Components
            }
          },
        },
      }
    )

    const { data: { user }, error } = await supabase.auth.getUser()

    if (error || !user) {
      return null
    }

    return user
  } catch (error) {
    console.error('[AUTH] Errore verifica autenticazione:', error)
    return null
  }
}

/**
 * Middleware per proteggere endpoint API
 * Ritorna una response di errore se l'utente non è autenticato
 */
export async function requireAuth(request?: NextRequest): Promise<NextResponse | null> {
  const user = await getAuthenticatedUser(request)

  if (!user) {
    return NextResponse.json(
      {
        error: 'Autenticazione richiesta',
        message: 'Devi effettuare il login per accedere a questa risorsa'
      },
      { status: 401 }
    )
  }

  return null // Nessun errore, l'utente è autenticato
}

/**
 * Verifica se l'utente è un amministratore
 * @returns true se admin, false altrimenti
 */
export async function isAdmin(request?: NextRequest): Promise<boolean> {
  const user = await getAuthenticatedUser(request)

  if (!user || !user.email) {
    return false
  }

  // Lista admin (sarà migrata a database in seguito)
  const ADMIN_EMAILS = [
    'admin@spediresicuro.com',
    'info@gdsgroup.it',
    'gdsgroupsas@gmail.com'
  ]

  return ADMIN_EMAILS.includes(user.email)
}

/**
 * Middleware per proteggere endpoint admin
 */
export async function requireAdmin(request?: NextRequest): Promise<NextResponse | null> {
  const user = await getAuthenticatedUser(request)

  if (!user) {
    return NextResponse.json(
      { error: 'Autenticazione richiesta' },
      { status: 401 }
    )
  }

  const userIsAdmin = await isAdmin(request)

  if (!userIsAdmin) {
    return NextResponse.json(
      {
        error: 'Accesso negato',
        message: 'Solo gli amministratori possono accedere a questa risorsa'
      },
      { status: 403 }
    )
  }

  return null // Nessun errore, l'utente è admin
}

/**
 * Crea client Supabase per API routes con autenticazione
 */
export function createAuthenticatedSupabaseClient() {
  const cookieStore = cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options })
          } catch (error) {
            // Ignora
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options })
          } catch (error) {
            // Ignora
          }
        },
      },
    }
  )
}
