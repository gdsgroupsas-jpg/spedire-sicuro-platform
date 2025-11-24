import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import type { SupabaseClient } from '@supabase/supabase-js'
import { shipmentSchema, type ShipmentFormValues } from '@/lib/schemas/shipment'
import type { ZodIssue } from 'zod'

type CapValidationRow = {
  cap: string
  city_name: string
  provincia: string
}

type ValidationResult<TMeta = Record<string, any>> = {
  isValid: boolean
  errors: string[]
  meta?: TMeta
  fatal?: boolean
}

type GoogleComponent = {
  long_name: string
  short_name: string
  types: string[]
}

function normalizeCityName(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^A-Za-z\s]/g, '')
    .trim()
    .replace(/\s+/g, ' ')
    .toUpperCase()
}

async function validateCapDataset(
  supabase: SupabaseClient<any>,
  cap: string,
  city: string,
  provincia: string
): Promise<ValidationResult<{ matchedRecord?: CapValidationRow; suggestions?: string[] }>> {
  const { data, error } = await supabase
    .from('cap_validation')
    .select('cap, city_name, provincia')
    .eq('cap', cap)
    .limit(25)

  if (error) {
    console.error('[shipments] CAP validation query failed', error)
    throw new Error('Errore durante la verifica del CAP.')
  }

  if (!data || data.length === 0) {
    return {
      isValid: false,
      errors: [`Il CAP ${cap} non è presente nel database di validazione.`],
    }
  }

  const normalizedCity = normalizeCityName(city)
  const normalizedProvince = provincia.trim().toUpperCase()

  const matchingRecord = data.find(
    (row) => normalizeCityName(row.city_name) === normalizedCity
  )

  if (!matchingRecord) {
    return {
      isValid: false,
      errors: [
        `Il CAP ${cap} non risulta associato alla città "${city}".`,
      ],
      meta: {
        suggestions: data.map((row) => row.city_name),
      },
    }
  }

  const recordProvince = (matchingRecord.provincia || '').trim().toUpperCase().slice(0, 2)
  if (recordProvince && recordProvince !== normalizedProvince) {
    return {
      isValid: false,
      errors: [
        `Il CAP ${cap} appartiene alla provincia ${recordProvince}, non ${normalizedProvince}.`,
      ],
      meta: { matchedRecord: matchingRecord },
    }
  }

  return {
    isValid: true,
    errors: [],
    meta: { matchedRecord: matchingRecord },
  }
}

function pickComponent(components: GoogleComponent[], type: string) {
  const match = components.find((component) => component.types.includes(type))
  if (!match) return null
  return {
    long: match.long_name,
    short: match.short_name,
  }
}

async function validateWithGoogleGeocoding(
  shipment: ShipmentFormValues
): Promise<
  ValidationResult<{
    formattedAddress?: string
    googlePostalCode?: string | null
    googleCity?: string | null
    googleProvince?: string | null
    rawStatus?: string
  }>
> {
  const apiKey =
    process.env.GOOGLE_MAPS_API_KEY ||
    process.env.GOOGLE_GEOCODING_API_KEY ||
    process.env.GOOGLE_API_KEY

  if (!apiKey) {
    return {
      isValid: false,
      errors: [
        'Variabile d\'ambiente GOOGLE_MAPS_API_KEY (o GOOGLE_GEOCODING_API_KEY) non configurata.',
      ],
      fatal: true,
    }
  }

  const query = `${shipment.indirizzo}, ${shipment.cap} ${shipment.localita} ${shipment.country || 'IT'}`
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
    query
  )}&language=it&region=it&key=${apiKey}`

  let response: Response
  try {
    response = await fetch(url, { cache: 'no-store' })
  } catch (error) {
    console.error('[shipments] Google Geocoding fetch error', error)
    return {
      isValid: false,
      errors: ['Impossibile contattare Google Geocoding. Riprova più tardi.'],
      fatal: true,
    }
  }

  if (!response.ok) {
    return {
      isValid: false,
      errors: [`Google Geocoding ha risposto con HTTP ${response.status}.`],
      fatal: true,
    }
  }

  const payload = await response.json()

  if (payload.status !== 'OK' || !payload.results?.length) {
    return {
      isValid: false,
      errors: [
        `Google Geocoding ha restituito lo stato "${payload.status}" per l'indirizzo fornito.`,
      ],
      meta: { rawStatus: payload.status },
    }
  }

  const result = payload.results[0]
  const components: GoogleComponent[] = result.address_components ?? []

  const postal = pickComponent(components, 'postal_code')
  const locality =
    pickComponent(components, 'locality') ??
    pickComponent(components, 'postal_town') ??
    pickComponent(components, 'administrative_area_level_3')
  const province =
    pickComponent(components, 'administrative_area_level_2') ??
    pickComponent(components, 'administrative_area_level_1')

  const errors: string[] = []

  if (postal?.long && postal.long !== shipment.cap) {
    errors.push(`Google riporta il CAP ${postal.long}, ma è stato inviato ${shipment.cap}.`)
  }

  if (locality?.long) {
    const googleCityNormalized = normalizeCityName(locality.long)
    if (googleCityNormalized !== normalizeCityName(shipment.localita)) {
      errors.push(`Google abbina il CAP a ${locality.long}, non a ${shipment.localita}.`)
    }
  }

  if (province?.short) {
    const googleProv = province.short.slice(0, 2).toUpperCase()
    if (googleProv !== shipment.provincia.toUpperCase()) {
      errors.push(`Google indica la provincia ${googleProv}, non ${shipment.provincia}.`)
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    meta: {
      formattedAddress: result.formatted_address,
      googlePostalCode: postal?.long ?? null,
      googleCity: locality?.long ?? null,
      googleProvince: province?.short ?? province?.long ?? null,
      rawStatus: payload.status,
    },
  }
}

function formatZodIssues(issues: ZodIssue[]) {
  return issues.map((issue) => ({
    path: issue.path.join('.') || 'root',
    message: issue.message,
  }))
}

export async function POST(req: NextRequest) {
  try {
    if (
      !process.env.NEXT_PUBLIC_SUPABASE_URL ||
      !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    ) {
      return NextResponse.json(
        { error: 'Supabase non configurato correttamente.' },
        { status: 500 }
      )
    }

    const cookieStore = cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
          set(name: string, value: string, options: CookieOptions) {
            cookieStore.set({ name, value, ...options })
          },
          remove(name: string, options: CookieOptions) {
            cookieStore.set({ name, value: '', ...options })
          },
        },
      }
    )

    const rawBody = await req.json().catch(() => null)
    if (!rawBody) {
      return NextResponse.json(
        { error: 'Body JSON mancante o non valido.' },
        { status: 400 }
      )
    }

    const validation = shipmentSchema.safeParse(rawBody)
    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Dati spedizione non validi.',
          details: formatZodIssues(validation.error.issues),
        },
        { status: 422 }
      )
    }

    const shipmentInput = validation.data

    const { data: userData, error: authError } = await supabase.auth.getUser()

    if (authError) {
      console.error('[shipments] Auth error', authError)
    }

    const user = userData?.user
    if (!user) {
      return NextResponse.json(
        { error: 'Autenticazione necessaria.' },
        { status: 401 }
      )
    }

    const capValidation = await validateCapDataset(
      supabase,
      shipmentInput.cap,
      shipmentInput.localita,
      shipmentInput.provincia
    )

    if (!capValidation.isValid) {
      return NextResponse.json(
        {
          error: 'Validazione CAP / Città fallita.',
          details: capValidation.errors,
          meta: capValidation.meta,
          source: 'cap_validation',
        },
        { status: 400 }
      )
    }

    const googleValidation = await validateWithGoogleGeocoding(shipmentInput)
    if (!googleValidation.isValid) {
      return NextResponse.json(
        {
          error: 'Validazione Google Geocoding fallita.',
          details: googleValidation.errors,
          meta: googleValidation.meta,
          source: 'google_geocoding',
        },
        { status: googleValidation.fatal ? 500 : 400 }
      )
    }

    let tenantId: string | null = null
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('tenant_id')
        .eq('id', user.id)
        .maybeSingle()

      if (profile?.tenant_id) {
        tenantId = profile.tenant_id
      }
    } catch (error) {
      console.warn('[shipments] Impossibile recuperare il tenant_id:', error)
    }

    const { usa_mittente_default, ...insertable } = shipmentInput

    const payload = {
      ...insertable,
      user_id: user.id,
      tenant_id: tenantId,
      country: insertable.country || 'IT',
    }

    const { data: shipment, error: insertError } = await supabase
      .from('spedizioni')
      .insert([payload])
      .select()
      .single()

    if (insertError) {
      console.error('[shipments] Errore inserimento spedizione', insertError)
      return NextResponse.json(
        { error: 'Salvataggio spedizione fallito.', details: insertError.message },
        { status: 500 }
      )
    }

    return NextResponse.json(
      {
        shipment,
        validation: {
          cap_validation: {
            passed: true,
            matched_city: capValidation.meta?.matchedRecord?.city_name,
            matched_province: capValidation.meta?.matchedRecord?.provincia,
          },
          google_geocoding: {
            passed: true,
            formatted_address: googleValidation.meta?.formattedAddress,
          },
        },
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('[shipments] Errore inatteso', error)
    return NextResponse.json(
      {
        error: 'Errore interno durante la creazione della spedizione.',
        details: error.message,
      },
      { status: 500 }
    )
  }
}
