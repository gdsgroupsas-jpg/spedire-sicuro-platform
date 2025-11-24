import { NextRequest, NextResponse } from 'next/server'
import { handleAPIError, handleValidationError } from '@/lib/error-handler'
import { WebhookOrderSchema, validateInput } from '@/lib/validation-schemas'
import crypto from 'crypto'

export async function POST(req: NextRequest) {
  console.log('[WEBHOOK] Incoming request...')

  // 1. Validate Content-Type
  const contentType = req.headers.get('content-type')
  if (!contentType?.includes('application/json')) {
    console.warn('[WEBHOOK] Invalid Content-Type:', contentType)
    return NextResponse.json(
      { error: 'Content-Type must be application/json' },
      { status: 400 }
    )
  }

  let payload: any

  try {
    // SECURITY: Verifica firma webhook (se configurata)
    const webhookSecret = process.env.WEBHOOK_SECRET
    if (webhookSecret) {
      const signature = req.headers.get('x-webhook-signature')
      const timestamp = req.headers.get('x-webhook-timestamp')

      if (!signature || !timestamp) {
        console.warn('[WEBHOOK] Missing signature or timestamp')
        return NextResponse.json(
          { error: 'Missing webhook signature or timestamp' },
          { status: 401 }
        )
      }

      // Verifica timestamp (previene replay attacks - max 5 minuti)
      const now = Date.now()
      const requestTime = parseInt(timestamp)
      if (Math.abs(now - requestTime) > 300000) {
        console.warn('[WEBHOOK] Timestamp too old or in future')
        return NextResponse.json(
          { error: 'Request timestamp invalid or expired' },
          { status: 401 }
        )
      }

      // Verifica firma HMAC
      const rawBody = await req.text()
      const expectedSignature = crypto
        .createHmac('sha256', webhookSecret)
        .update(`${timestamp}.${rawBody}`)
        .digest('hex')

      if (signature !== expectedSignature) {
        console.error('[WEBHOOK] Invalid signature detected!')
        return NextResponse.json(
          { error: 'Invalid webhook signature' },
          { status: 401 }
        )
      }

      // Parse dopo verifica firma
      payload = JSON.parse(rawBody)
    } else {
      console.warn('[WEBHOOK] WEBHOOK_SECRET not configured - signature verification skipped')
      // Parse payload normalmente
      payload = await req.json()
    }

    // SECURITY: Validazione payload
    const validation = validateInput(WebhookOrderSchema, payload)
    if (!validation.success) {
      return handleValidationError(validation.error, 'WEBHOOK')
    }
    
    // 3. Log Event (Stub for DB insertion)
    console.log('------------------------------------------------')
    console.log('📦 [OMNICHANNEL] Ordine ricevuto da Marketplace')
    console.log('   Source: ', req.headers.get('x-source') || 'Unknown')
    console.log('   Order ID:', payload.id || payload.order_id || 'N/A')
    console.log('   Total:   ', payload.total_price || payload.total || '0.00')
    console.log('------------------------------------------------')
    
    // In production: Insert into 'spedizioni' table or 'orders' queue
    
    // 4. Acknowledge success immediately to avoid timeouts
    return NextResponse.json({ 
      success: true, 
      message: 'Webhook received and queued', 
      timestamp: new Date().toISOString()
    }, { status: 200 })

  } catch (error: any) {
    // SECURITY: Gestione sicura errori
    return handleAPIError(error, 'WEBHOOK', 'Error processing webhook')
  }
}
