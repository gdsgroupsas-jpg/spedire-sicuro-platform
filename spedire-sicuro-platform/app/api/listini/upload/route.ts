import { NextRequest, NextResponse } from 'next/server'
import { createClient, type SupabaseClient, type PostgrestSingleResponse } from '@supabase/supabase-js'
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database, TablesInsert, Tables } from '@/lib/database.types'
import { validateFileType, validateFileSize } from '@/lib/validation-schemas'

// Inizializza Admin Supabase client (Singleton)
let supabaseAdmin: SupabaseClient<Database> | null = null

function getSupabaseAdminClient(): SupabaseClient<Database> {
  if (!supabaseAdmin) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    
    if (!url || !serviceRoleKey) {
      throw new Error('Configurazione Supabase Admin mancante: SUPABASE_SERVICE_ROLE_KEY richiesta')
    }
    
    supabaseAdmin = createClient(url, serviceRoleKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false
      }
    })
  }
  return supabaseAdmin
}

async function checkAdminAuth(request: NextRequest) {
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
            // The `set` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options })
          } catch (error) {
            // The `delete` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )

  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user) {
    return false
  }

  // Controlla se l'email è autorizzata come admin
  // In produzione, questo dovrebbe essere un check sul database (tabella profiles o roles)
  const ADMIN_EMAILS = ['admin@spediresicuro.com', 'info@gdsgroup.it', 'gdsgroupsas@gmail.com'] 
  return ADMIN_EMAILS.includes(user.email || '')
}

// GET method per test (solo environment check)
export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      message: 'API /api/listini/upload è attiva',
      environment: process.env.NODE_ENV
    })
  } catch (error: any) {
    return NextResponse.json({ error: 'Server Error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  console.log('[UPLOAD] POST request ricevuta')
  
  // 1. Security Check: Authentication & Role
  const isAdmin = await checkAdminAuth(request)
  if (!isAdmin) {
    console.warn('[UPLOAD] Tentativo di accesso non autorizzato')
    return NextResponse.json(
      { error: 'Unauthorized: Solo gli amministratori possono caricare listini' },
      { status: 403 }
    )
  }
  
  try {
    const client = getSupabaseAdminClient()

    const formData = await request.formData()
    const fornitore = formData.get('fornitore') as string
    const servizio = formData.get('servizio') as string
    const file = formData.get('file') as File

    // Validazione input base
    if (!fornitore || !servizio || !file) {
      return NextResponse.json(
        { error: 'Parametri mancanti: fornitore, servizio o file' },
        { status: 400 }
      )
    }

    // SECURITY: Validazione dimensione file (max 5MB)
    const sizeValidation = validateFileSize(file, 5 * 1024 * 1024)
    if (!sizeValidation.valid) {
      return NextResponse.json(
        { error: sizeValidation.error },
        { status: 413 }
      )
    }

    // SECURITY: Validazione tipo file (solo CSV e Excel)
    const allowedMimeTypes = [
      'text/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/csv',
      'text/plain' // Alcuni browser segnano CSV come text/plain
    ]
    const allowedExtensions = ['.csv', '.xls', '.xlsx']

    const fileValidation = validateFileType(file, allowedMimeTypes, allowedExtensions)
    if (!fileValidation.valid) {
      return NextResponse.json(
        { error: fileValidation.error },
        { status: 400 }
      )
    }

    // SECURITY: Limita numero righe per prevenire DoS
    const MAX_ROWS = 10000

    // Leggi contenuto file
    const text = await file.text()
    const lines = text.trim().split('\n').filter(line => line.trim())

    if (lines.length < 2) {
      return NextResponse.json(
        { error: 'CSV deve contenere almeno header e una riga dati' },
        { status: 400 }
      )
    }

    // SECURITY: Check numero massimo righe
    if (lines.length > MAX_ROWS) {
      return NextResponse.json(
        { error: `File troppo grande: massimo ${MAX_ROWS} righe permesse` },
        { status: 400 }
      )
    }
    
    const headers = lines[0].split(';').map(h => h.trim().toLowerCase())
    
    // Security check: Required headers
    if (!headers.includes('peso_min') || !headers.includes('peso_max')) {
      return NextResponse.json(
        { error: 'CSV deve contenere: peso_min;peso_max' },
        { status: 400 }
      )
    }

    // Parse fasce peso
    type FasciaPeso = {
      peso_min: number
      peso_max: number
      prezzi: Record<string, number>
    }

    const fasce: FasciaPeso[] = []
    type ListinoRow = Tables<'listini_corrieri'>

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim()
      if (!line) continue
      
      const values = line.split(';').map(v => v.trim().replace(',', '.'))
      const row: Record<string, string> = {}
      
      headers.forEach((header, index) => {
        row[header] = values[index] || ''
      })
      
      const pesoMin = parseFloat(row.peso_min || '0')
      const pesoMax = parseFloat(row.peso_max || '0')
      
      if (isNaN(pesoMin) || isNaN(pesoMax)) continue
      
      const prezzi: Record<string, number> = {}
      
      headers.forEach(header => {
        if (header !== 'peso_min' && header !== 'peso_max') {
          const prezzo = parseFloat(row[header] || '0')
          if (!isNaN(prezzo) && prezzo > 0) {
            prezzi[header] = prezzo
          }
        }
      })
      
      fasce.push({
        peso_min: pesoMin,
        peso_max: pesoMax,
        prezzi
      })
    }

    if (fasce.length === 0) {
      return NextResponse.json(
        { error: 'CSV non contiene fasce di prezzo valide' },
        { status: 400 }
      )
    }

    // Crea oggetto listino
    const datiListino = {
      tipo_listino: 'fasce_peso',
      fasce,
      iva_inclusa: false,
      note: `Caricato il ${new Date().toLocaleDateString('it-IT')}`
    } satisfies TablesInsert<'listini_corrieri'>['dati_listino']

    const zoneCoperte = headers.filter(h => h !== 'peso_min' && h !== 'peso_max')
    const pesoMinGenerale = Math.min(...fasce.map(f => f.peso_min))
    const pesoMaxGenerale = Math.max(...fasce.map(f => f.peso_max))

    // Inserisci su Supabase con Admin Client (Bypass RLS)
    const payload: TablesInsert<'listini_corrieri'> = {
      fornitore: fornitore.trim(),
      servizio: servizio.trim(),
      file_originale: file.name,
      dati_listino: datiListino,
      zone_coperte: zoneCoperte,
      peso_min: pesoMinGenerale,
      peso_max: pesoMaxGenerale,
      attivo: true
    }

    const insertResult: PostgrestSingleResponse<ListinoRow> = await (client.from('listini_corrieri') as any)
      .insert([payload])
      .select()
      .single()
    
    const { data, error } = insertResult

    if (error) {
      console.error('[UPLOAD] Errore Supabase:', error)
      return NextResponse.json(
        { error: `Errore database: ${error.message}` },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Listino caricato con successo',
      data: {
        id: data?.id,
        fornitore: data?.fornitore,
        servizio: data?.servizio,
        fasce_count: fasce.length
      }
    })

  } catch (error: any) {
    console.error('[UPLOAD] Critical Error:', error)
    return NextResponse.json(
      { error: `Errore server: ${error.message}` },
      { status: 500 }
    )
  }
}

