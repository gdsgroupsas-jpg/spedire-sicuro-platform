import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { shipmentSchema } from '@/lib/schemas/shipment'
import { validateAddressWithGoogle } from '@/lib/geocoding'

export async function POST(request: Request) {
  try {
    const cookieStore = cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) { return cookieStore.get(name)?.value },
          set(name: string, value: string, options: CookieOptions) { cookieStore.set({ name, value, ...options }) },
          remove(name: string, options: CookieOptions) { cookieStore.set({ name, value: '', ...options }) },
        },
      }
    )

    const json = await request.json()
    
    // 1. Validate Request Body
    const validationResult = shipmentSchema.safeParse(json)
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Dati non validi", details: validationResult.error.flatten() },
        { status: 400 }
      )
    }
    
    const data = validationResult.data

    // 2. CAP-City Validation
    // Check DB first
    const { data: capEntry, error: capError } = await supabase
      .from('cap_validation')
      .select('*')
      .eq('cap', data.cap)
      .maybeSingle()

    if (capError) {
        console.error("Error querying cap_validation:", capError);
        // Proceed to fallback if DB error? Or fail? Let's proceed to fallback.
    }

    let isValidAddress = false;
    let validationError = "";

    if (capEntry) {
        // Validate against DB entry
        const dbCity = capEntry.citta.toLowerCase();
        const dbProv = capEntry.provincia.toLowerCase();
        const inputCity = data.localita.toLowerCase();
        const inputProv = data.provincia.toLowerCase();

        // Basic normalization could be added here
        if (dbCity === inputCity && dbProv === inputProv) {
            isValidAddress = true;
        } else {
             if (dbCity !== inputCity) {
                 validationError = `La città inserita (${data.localita}) non corrisponde al CAP ${data.cap} (Atteso: ${capEntry.citta})`;
             } else if (dbProv !== inputProv) {
                 validationError = `La provincia inserita (${data.provincia}) non corrisponde al CAP ${data.cap} (Atteso: ${capEntry.provincia})`;
             }
        }
    } else {
        // Fallback to Google Geocoding
        const googleResult = await validateAddressWithGoogle(data.cap, data.localita, data.provincia, data.country);
        if (googleResult.isValid) {
            isValidAddress = true;
            // Optional: We could cache this result in cap_validation table here
        } else {
            validationError = googleResult.error || "Indirizzo non valido secondo la verifica geografica.";
        }
    }

    if (!isValidAddress) {
        return NextResponse.json(
            { error: "Errore Validazione Indirizzo", message: validationError },
            { status: 400 }
        )
    }

    // 3. Insert Shipment
    const { data: shipment, error: insertError } = await supabase
      .from('spedizioni')
      .insert([{
        ...data,
        created_at: new Date().toISOString(),
        status: data.status || 'bozza' 
      }])
      .select()
      .single()

    if (insertError) {
        return NextResponse.json(
            { error: "Errore salvataggio spedizione", details: insertError.message },
            { status: 500 }
        )
    }

    return NextResponse.json(shipment)

  } catch (error: any) {
    console.error("API Error:", error)
    return NextResponse.json(
      { error: "Internal Server Error", message: error.message },
      { status: 500 }
    )
  }
}
