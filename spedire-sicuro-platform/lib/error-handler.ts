import { NextResponse } from 'next/server'

/**
 * Gestione sicura degli errori API
 * Non espone dettagli interni in produzione
 */
export function handleAPIError(
  error: unknown,
  context: string,
  customMessage?: string
): NextResponse {
  // Log completo server-side per debugging
  const errorDetails = {
    context,
    message: error instanceof Error ? error.message : 'Unknown error',
    stack: error instanceof Error ? error.stack : undefined,
    timestamp: new Date().toISOString(),
    type: error instanceof Error ? error.constructor.name : typeof error,
  }

  console.error(`[${context}] Error:`, errorDetails)

  // Response al client (sicura)
  const isDevelopment = process.env.NODE_ENV === 'development'

  if (isDevelopment) {
    // In development: mostra dettagli per debug
    return NextResponse.json(
      {
        error: customMessage || 'Si è verificato un errore',
        details: errorDetails.message,
        type: errorDetails.type,
        context,
      },
      { status: 500 }
    )
  } else {
    // In production: messaggio generico
    return NextResponse.json(
      {
        error: customMessage || 'Si è verificato un errore interno. Riprova più tardi.',
        code: 'INTERNAL_ERROR',
        request_id: crypto.randomUUID(), // Per supporto tecnico
      },
      { status: 500 }
    )
  }
}

/**
 * Gestione errori di validazione
 */
export function handleValidationError(
  validationError: any,
  context: string
): NextResponse {
  console.warn(`[${context}] Validation error:`, validationError)

  return NextResponse.json(
    {
      error: 'Dati non validi',
      message: validationError.message || 'I dati forniti non sono validi',
      details: validationError.details || validationError,
    },
    { status: 400 }
  )
}

/**
 * Errore di autenticazione
 */
export function handleAuthError(message?: string): NextResponse {
  return NextResponse.json(
    {
      error: 'Autenticazione richiesta',
      message: message || 'Devi effettuare il login per accedere a questa risorsa',
    },
    { status: 401 }
  )
}

/**
 * Errore di autorizzazione
 */
export function handleAuthorizationError(message?: string): NextResponse {
  return NextResponse.json(
    {
      error: 'Accesso negato',
      message: message || 'Non hai i permessi per accedere a questa risorsa',
    },
    { status: 403 }
  )
}

/**
 * Errore di rate limiting
 */
export function handleRateLimitError(retryAfter?: number): NextResponse {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }

  if (retryAfter) {
    headers['Retry-After'] = retryAfter.toString()
  }

  return NextResponse.json(
    {
      error: 'Troppi tentativi',
      message: 'Hai superato il limite di richieste. Riprova più tardi.',
      retry_after_seconds: retryAfter,
    },
    { status: 429, headers }
  )
}
