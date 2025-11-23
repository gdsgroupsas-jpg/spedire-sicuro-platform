import { NextRequest, NextResponse } from 'next/server'

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

  try {
    // 2. Parse Payload
    const payload = await req.json()
    
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
    console.error('[WEBHOOK] Error processing payload:', error)
    return NextResponse.json(
      { error: 'Invalid JSON payload', details: error.message }, 
      { status: 400 }
    )
  }
}
