import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'
import { shipmentSchema } from '@/lib/schemas/shipment'
import { z } from 'zod'

// Environment variable for Google Geocoding API (to be added in production)
const GOOGLE_GEOCODING_API_KEY = process.env.GOOGLE_GEOCODING_API_KEY

// Types for validation responses
interface CAPValidation {
  isValid: boolean
  errors: string[]
  warnings: string[]
  suggestedCorrection?: {
    cap?: string
    city?: string
    provincia?: string
  }
}

interface AddressValidation extends CAPValidation {
  geocodingResult?: {
    formattedAddress: string
    lat: number
    lng: number
    confidence: number
  }
}

/**
 * Validates CAP (Italian postal code) against the cap_validation table
 * Checks if CAP exists and matches with city and province
 */
async function validateCAP(
  supabase: any,
  cap: string,
  city: string,
  provincia: string,
  isRecipient: boolean = true
): Promise<CAPValidation> {
  const errors: string[] = []
  const warnings: string[] = []
  const addressType = isRecipient ? 'destinatario' : 'mittente'

  try {
    // Query cap_validation table for the given CAP
    const { data: capData, error } = await supabase
      .from('cap_validation')
      .select('*')
      .eq('cap', cap)
      .eq('is_active', true)

    if (error) {
      console.error('Error querying cap_validation:', error)
      warnings.push(`Impossibile verificare il CAP ${addressType} nel database`)
      return { isValid: true, errors, warnings } // Allow to continue with warning
    }

    // Check if CAP exists
    if (!capData || capData.length === 0) {
      errors.push(`CAP ${addressType} '${cap}' non trovato nel database italiano`)
      
      // Try to find suggestions based on city
      const { data: citySuggestions } = await supabase
        .from('cap_validation')
        .select('cap, city_name, provincia')
        .ilike('city_name', `%${city}%`)
        .eq('is_active', true)
        .limit(3)
      
      if (citySuggestions && citySuggestions.length > 0) {
        const suggestion = citySuggestions[0]
        return {
          isValid: false,
          errors,
          warnings,
          suggestedCorrection: {
            cap: suggestion.cap,
            city: suggestion.city_name,
            provincia: suggestion.provincia
          }
        }
      }
      
      return { isValid: false, errors, warnings }
    }

    // Find exact match for city and province
    const exactMatch = capData.find((entry: any) => {
      const cityMatch = entry.city_name.toLowerCase() === city.toLowerCase()
      const provinciaMatch = entry.provincia.toUpperCase() === provincia.toUpperCase()
      return cityMatch && provinciaMatch
    })

    if (exactMatch) {
      // Perfect match found
      return { isValid: true, errors, warnings }
    }

    // Check for partial matches to provide helpful error messages
    const cityMatches = capData.filter((entry: any) => 
      entry.city_name.toLowerCase() === city.toLowerCase()
    )
    const provinciaMatches = capData.filter((entry: any) => 
      entry.provincia.toUpperCase() === provincia.toUpperCase()
    )

    // Build specific error messages based on mismatches
    if (cityMatches.length === 0 && provinciaMatches.length === 0) {
      // CAP doesn't match either city or province
      const validEntry = capData[0]
      errors.push(
        `CAP ${addressType} '${cap}' appartiene a ${validEntry.city_name} (${validEntry.provincia}), ` +
        `non a ${city} (${provincia})`
      )
      return {
        isValid: false,
        errors,
        warnings,
        suggestedCorrection: {
          city: validEntry.city_name,
          provincia: validEntry.provincia
        }
      }
    } else if (cityMatches.length > 0 && provinciaMatches.length === 0) {
      // City matches but province doesn't
      const validEntry = cityMatches[0]
      errors.push(
        `Provincia ${addressType} '${provincia}' non corrisponde al CAP ${cap}. ` +
        `La provincia corretta per ${city} con CAP ${cap} è '${validEntry.provincia}'`
      )
      return {
        isValid: false,
        errors,
        warnings,
        suggestedCorrection: {
          provincia: validEntry.provincia
        }
      }
    } else if (cityMatches.length === 0 && provinciaMatches.length > 0) {
      // Province matches but city doesn't
      const validEntry = provinciaMatches[0]
      errors.push(
        `Città ${addressType} '${city}' non corrisponde al CAP ${cap}. ` +
        `La città corretta per il CAP ${cap} in provincia ${provincia} è '${validEntry.city_name}'`
      )
      return {
        isValid: false,
        errors,
        warnings,
        suggestedCorrection: {
          city: validEntry.city_name
        }
      }
    }

    // Some other mismatch scenario
    const validEntry = capData[0]
    errors.push(
      `Combinazione CAP-Città-Provincia ${addressType} non valida. ` +
      `Il CAP ${cap} corrisponde a ${validEntry.city_name} (${validEntry.provincia})`
    )
    return {
      isValid: false,
      errors,
      warnings,
      suggestedCorrection: {
        city: validEntry.city_name,
        provincia: validEntry.provincia
      }
    }

  } catch (error: any) {
    console.error('CAP validation error:', error)
    warnings.push(`Errore durante la validazione del CAP ${addressType}`)
    return { isValid: true, errors, warnings } // Allow to continue with warning
  }
}

/**
 * Validates address using Google Geocoding API
 * This is a placeholder that can be implemented when API key is available
 */
async function validateAddressWithGoogle(
  address: string,
  cap: string,
  city: string,
  provincia: string,
  country: string = 'IT'
): Promise<{
  isValid: boolean
  confidence: number
  formattedAddress?: string
  coordinates?: { lat: number; lng: number }
  errors: string[]
}> {
  if (!GOOGLE_GEOCODING_API_KEY) {
    // Return success if Google API is not configured
    return { 
      isValid: true, 
      confidence: 0, 
      errors: []
    }
  }

  try {
    // Construct full address for geocoding
    const fullAddress = `${address}, ${cap} ${city} ${provincia}, ${country}`
    
    // Make request to Google Geocoding API
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
        fullAddress
      )}&key=${GOOGLE_GEOCODING_API_KEY}&language=it&region=it`
    )
    
    if (!response.ok) {
      console.error('Google Geocoding API error:', response.statusText)
      return {
        isValid: true, // Don't block if API fails
        confidence: 0,
        errors: ['Impossibile verificare indirizzo con Google Maps']
      }
    }

    const data = await response.json()
    
    if (data.status !== 'OK' || !data.results || data.results.length === 0) {
      return {
        isValid: false,
        confidence: 0,
        errors: ['Indirizzo non trovato su Google Maps']
      }
    }

    const result = data.results[0]
    const components = result.address_components
    
    // Extract postal code and administrative areas from Google's response
    let googleCAP = ''
    let googleCity = ''
    let googleProvince = ''
    
    for (const component of components) {
      if (component.types.includes('postal_code')) {
        googleCAP = component.long_name
      }
      if (component.types.includes('locality')) {
        googleCity = component.long_name
      }
      if (component.types.includes('administrative_area_level_2')) {
        googleProvince = component.short_name
      }
    }

    // Calculate confidence based on matches
    let confidence = 0.25 // Base confidence for finding an address
    const errors: string[] = []

    if (googleCAP === cap) {
      confidence += 0.25
    } else if (googleCAP) {
      errors.push(`Google Maps suggerisce CAP ${googleCAP} invece di ${cap}`)
    }

    if (googleCity.toLowerCase() === city.toLowerCase()) {
      confidence += 0.25
    } else if (googleCity) {
      errors.push(`Google Maps suggerisce città ${googleCity} invece di ${city}`)
    }

    if (googleProvince.toUpperCase() === provincia.toUpperCase()) {
      confidence += 0.25
    } else if (googleProvince) {
      errors.push(`Google Maps suggerisce provincia ${googleProvince} invece di ${provincia}`)
    }

    return {
      isValid: confidence >= 0.5, // Consider valid if at least 50% confidence
      confidence,
      formattedAddress: result.formatted_address,
      coordinates: {
        lat: result.geometry.location.lat,
        lng: result.geometry.location.lng
      },
      errors
    }

  } catch (error: any) {
    console.error('Google Geocoding error:', error)
    return {
      isValid: true, // Don't block if API fails
      confidence: 0,
      errors: ['Errore durante la verifica con Google Maps']
    }
  }
}

/**
 * Comprehensive address validation combining CAP table and Google Geocoding
 */
async function validateFullAddress(
  supabase: any,
  addressData: {
    cap: string
    city: string
    provincia: string
    address: string
    country?: string
  },
  isRecipient: boolean = true
): Promise<AddressValidation> {
  const errors: string[] = []
  const warnings: string[] = []
  
  // Step 1: Validate CAP against database
  const capValidation = await validateCAP(
    supabase,
    addressData.cap,
    addressData.city,
    addressData.provincia,
    isRecipient
  )
  
  errors.push(...capValidation.errors)
  warnings.push(...capValidation.warnings)

  // Step 2: Validate with Google Geocoding API (if CAP validation passed or has warnings only)
  let geocodingResult = undefined
  if (capValidation.isValid || capValidation.errors.length === 0) {
    const googleValidation = await validateAddressWithGoogle(
      addressData.address,
      addressData.cap,
      addressData.city,
      addressData.provincia,
      addressData.country || 'IT'
    )
    
    if (!googleValidation.isValid) {
      warnings.push(...googleValidation.errors)
    }
    
    if (googleValidation.formattedAddress && googleValidation.coordinates) {
      geocodingResult = {
        formattedAddress: googleValidation.formattedAddress,
        lat: googleValidation.coordinates.lat,
        lng: googleValidation.coordinates.lng,
        confidence: googleValidation.confidence
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    suggestedCorrection: capValidation.suggestedCorrection,
    geocodingResult
  }
}

export async function POST(req: NextRequest) {
  try {
    // Parse request body
    const body = await req.json()
    
    // Validate request data with Zod schema
    let validatedData
    try {
      validatedData = shipmentSchema.parse(body)
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { 
            error: 'Dati spedizione non validi',
            details: error.errors.map(e => ({
              field: e.path.join('.'),
              message: e.message
            }))
          },
          { status: 400 }
        )
      }
      throw error
    }

    // Get Supabase client
    const supabase = createClient()
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Non autenticato' },
        { status: 401 }
      )
    }

    // Initialize validation results
    const validationResults = {
      recipient: null as AddressValidation | null,
      sender: null as AddressValidation | null,
      isValid: true,
      allErrors: [] as string[],
      allWarnings: [] as string[],
      suggestions: {} as any
    }

    // Validate recipient address
    const recipientValidation = await validateFullAddress(
      supabase,
      {
        cap: validatedData.cap,
        city: validatedData.localita,
        provincia: validatedData.provincia,
        address: validatedData.indirizzo,
        country: validatedData.country
      },
      true
    )
    
    validationResults.recipient = recipientValidation
    validationResults.allErrors.push(...recipientValidation.errors.map(e => `Destinatario: ${e}`))
    validationResults.allWarnings.push(...recipientValidation.warnings.map(w => `Destinatario: ${w}`))
    
    if (recipientValidation.suggestedCorrection) {
      validationResults.suggestions.recipient = recipientValidation.suggestedCorrection
    }

    // Validate sender address if not using default
    if (!validatedData.usa_mittente_default && 
        validatedData.mittente_cap && 
        validatedData.mittente_citta && 
        validatedData.mittente_provincia) {
      
      const senderValidation = await validateFullAddress(
        supabase,
        {
          cap: validatedData.mittente_cap,
          city: validatedData.mittente_citta,
          provincia: validatedData.mittente_provincia,
          address: validatedData.mittente_indirizzo || '',
          country: 'IT'
        },
        false
      )
      
      validationResults.sender = senderValidation
      validationResults.allErrors.push(...senderValidation.errors.map(e => `Mittente: ${e}`))
      validationResults.allWarnings.push(...senderValidation.warnings.map(w => `Mittente: ${w}`))
      
      if (senderValidation.suggestedCorrection) {
        validationResults.suggestions.sender = senderValidation.suggestedCorrection
      }
    }

    // Check if validation passed
    validationResults.isValid = validationResults.allErrors.length === 0

    // If validation failed, return errors with suggestions
    if (!validationResults.isValid) {
      return NextResponse.json(
        {
          error: 'Validazione indirizzo fallita',
          validationErrors: validationResults.allErrors,
          warnings: validationResults.allWarnings,
          suggestions: validationResults.suggestions,
          message: 'Controlla gli indirizzi inseriti. I CAP devono corrispondere esattamente alla città e provincia specificate.'
        },
        { status: 400 }
      )
    }

    // Prepare data for database insertion
    const shipmentData = {
      ...validatedData,
      user_id: user.id,
      created_at: new Date().toISOString(),
      status: body.status || 'bozza',
      // Add geocoding coordinates if available
      geocoding_data: {
        recipient: validationResults.recipient?.geocodingResult || null,
        sender: validationResults.sender?.geocodingResult || null
      }
    }

    // Save to database
    const { data: savedShipment, error: dbError } = await supabase
      .from('spedizioni')
      .insert([shipmentData])
      .select()
      .single()

    if (dbError) {
      console.error('Database error:', dbError)
      return NextResponse.json(
        { 
          error: 'Errore durante il salvataggio della spedizione',
          details: dbError.message
        },
        { status: 500 }
      )
    }

    // Log the operation
    await supabase
      .from('log_operazioni')
      .insert([{
        tipo: 'creazione_spedizione',
        dettagli: {
          shipment_id: savedShipment.id,
          user_id: user.id,
          validation_warnings: validationResults.allWarnings,
          geocoding_confidence: {
            recipient: validationResults.recipient?.geocodingResult?.confidence || 0,
            sender: validationResults.sender?.geocodingResult?.confidence || 0
          }
        },
        esito: 'successo'
      }])

    // Return success response with shipment data and any warnings
    return NextResponse.json({
      success: true,
      data: savedShipment,
      warnings: validationResults.allWarnings,
      message: validationResults.allWarnings.length > 0 
        ? 'Spedizione creata con avvertimenti'
        : 'Spedizione creata con successo',
      geocoding: {
        recipient: validationResults.recipient?.geocodingResult,
        sender: validationResults.sender?.geocodingResult
      }
    })

  } catch (error: any) {
    console.error('Shipment creation error:', error)
    return NextResponse.json(
      { 
        error: 'Errore interno del server',
        details: error.message 
      },
      { status: 500 }
    )
  }
}

// GET endpoint to retrieve shipments
export async function GET(req: NextRequest) {
  try {
    const supabase = createClient()
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Non autenticato' },
        { status: 401 }
      )
    }

    // Parse query parameters
    const { searchParams } = new URL(req.url)
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')
    const status = searchParams.get('status')
    
    // Build query
    let query = supabase
      .from('spedizioni')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)
    
    if (status) {
      query = query.eq('status', status)
    }

    const { data, error } = await query

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { 
          error: 'Errore durante il recupero delle spedizioni',
          details: error.message
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data,
      pagination: {
        limit,
        offset,
        total: data?.length || 0
      }
    })

  } catch (error: any) {
    console.error('Get shipments error:', error)
    return NextResponse.json(
      { 
        error: 'Errore interno del server',
        details: error.message 
      },
      { status: 500 }
    )
  }
}