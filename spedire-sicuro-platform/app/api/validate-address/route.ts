import { NextResponse } from 'next/server'
import { validateAddressWithGoogle, validateAndNormalizeAddressWithAI } from '@/lib/geocoding'

/**
 * API Endpoint per validazione indirizzi in tempo reale
 * 
 * Supporta due modalità:
 * 1. Validazione strutturata (cap, città, provincia separati)
 * 2. Validazione AI-powered (indirizzo grezzo da parsare)
 * 
 * POST /api/validate-address
 * Body: 
 * - Modalità 1: { cap, city, province, country?, fullAddress? }
 * - Modalità 2: { rawAddress, country? }
 */
export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Modalità 2: Validazione AI-powered di indirizzo grezzo
    if (body.rawAddress) {
      console.log('[VALIDATE-API] Modalità AI - Raw Address:', body.rawAddress)
      
      const result = await validateAndNormalizeAddressWithAI(
        body.rawAddress,
        body.country || 'IT'
      )

      return NextResponse.json({
        success: result.isValid,
        ...result
      })
    }

    // Modalità 1: Validazione strutturata
    const { cap, city, province, country = 'IT', fullAddress } = body

    if (!cap || !city || !province) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Parametri mancanti: cap, city e province sono obbligatori' 
        },
        { status: 400 }
      )
    }

    console.log('[VALIDATE-API] Modalità Strutturata:', { cap, city, province, country })

    const result = await validateAddressWithGoogle(
      cap,
      city,
      province,
      country,
      fullAddress
    )

    return NextResponse.json({
      success: result.isValid,
      ...result
    })

  } catch (error: any) {
    console.error('[VALIDATE-API] Errore:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Errore durante la validazione',
        details: error.message 
      },
      { status: 500 }
    )
  }
}

/**
 * GET endpoint per test rapido
 */
export async function GET() {
  return NextResponse.json({
    service: 'Address Validation API',
    status: 'online',
    features: [
      'Google Maps Geocoding',
      'AI-powered address parsing',
      'Fuzzy city name matching',
      'Auto-correction suggestions',
      'Confidence scoring'
    ],
    usage: {
      structured: 'POST { cap, city, province, country?, fullAddress? }',
      ai_powered: 'POST { rawAddress, country? }'
    }
  })
}
