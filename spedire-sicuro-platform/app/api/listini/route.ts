import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServerClient } from '@/lib/supabase'

// GET tutti i listini
export async function GET(req: NextRequest) {
  try {
    const supabase = getSupabaseServerClient()
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
    return NextResponse.json(
      { error: 'Errore server', details: error.message },
      { status: 500 }
    )
  }
}

// PUT aggiorna listino (attiva/disattiva o modifica)
export async function PUT(req: NextRequest) {
  try {
    const supabase = getSupabaseServerClient()
    const { id, attivo, dati_listino, regole_contrassegno } = await req.json()

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
    return NextResponse.json(
      { error: 'Errore server', details: error.message },
      { status: 500 }
    )
  }
}

// DELETE elimina listino
export async function DELETE(req: NextRequest) {
  try {
    const supabase = getSupabaseServerClient()
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'ID listino obbligatorio' },
        { status: 400 }
      )
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
    return NextResponse.json(
      { error: 'Errore server', details: error.message },
      { status: 500 }
    )
  }
}

