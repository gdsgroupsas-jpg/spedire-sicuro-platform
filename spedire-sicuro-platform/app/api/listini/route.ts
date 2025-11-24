import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { requireAuth, requireAdmin } from '@/lib/auth-helpers'
import { handleAPIError, handleValidationError } from '@/lib/error-handler'
import { ListinoUpdateSchema, ListinoDeleteSchema, validateInput } from '@/lib/validation-schemas'

// GET tutti i listini
export async function GET(req: NextRequest) {
  // SECURITY: Verifica autenticazione (lettura permessa a tutti gli utenti autenticati)
  const authError = await requireAuth(req)
  if (authError) {
    return authError
  }

  try {
    const { searchParams } = new URL(req.url)
    const attivo = searchParams.get('attivo')

    let query = supabase.from('listini_corrieri').select('*')

    if (attivo === 'true') {
      query = query.eq('attivo', true)
    }

    const { data, error } = await query.order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json(
        { error: 'Errore recupero listini', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, data })
  } catch (error: any) {
    return handleAPIError(error, 'LISTINI_GET', 'Errore recupero listini')
  }
}

// PUT aggiorna listino (attiva/disattiva o modifica)
export async function PUT(req: NextRequest) {
  // SECURITY: Solo admin possono modificare listini
  const adminError = await requireAdmin(req)
  if (adminError) {
    return adminError
  }

  try {
    const body = await req.json()

    // SECURITY: Validazione input
    const validation = validateInput(ListinoUpdateSchema, body)
    if (!validation.success) {
      return handleValidationError(validation.error, 'LISTINI_PUT')
    }

    const { id, attivo, dati_listino, regole_contrassegno } = validation.data

    if (!id) {
      return NextResponse.json(
        { error: 'ID listino obbligatorio' },
        { status: 400 }
      )
    }

    const updateData: any = {}
    if (attivo !== undefined) updateData.attivo = attivo
    if (dati_listino) updateData.dati_listino = dati_listino
    if (regole_contrassegno !== undefined) updateData.regole_contrassegno = regole_contrassegno

    const { data, error } = await (supabase.from('listini_corrieri') as any)
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      return NextResponse.json(
        { error: 'Errore aggiornamento listino', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, data })
  } catch (error: any) {
    return handleAPIError(error, 'LISTINI_PUT', 'Errore aggiornamento listino')
  }
}

// DELETE elimina listino
export async function DELETE(req: NextRequest) {
  // SECURITY: Solo admin possono eliminare listini
  const adminError = await requireAdmin(req)
  if (adminError) {
    return adminError
  }

  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'ID listino obbligatorio' },
        { status: 400 }
      )
    }

    // SECURITY: Validazione ID
    const validation = validateInput(ListinoDeleteSchema, { id })
    if (!validation.success) {
      return handleValidationError(validation.error, 'LISTINI_DELETE')
    }

    const { error } = await supabase
      .from('listini_corrieri')
      .delete()
      .eq('id', id)

    if (error) {
      return NextResponse.json(
        { error: 'Errore eliminazione listino', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return handleAPIError(error, 'LISTINI_DELETE', 'Errore eliminazione listino')
  }
}

