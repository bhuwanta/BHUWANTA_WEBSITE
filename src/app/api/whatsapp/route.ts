import { NextResponse } from 'next/server'

const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || 'bhuwanta_verify_2026'

// Handle Webhook Verification (GET request from Meta)
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  
  const mode = searchParams.get('hub.mode')
  const token = searchParams.get('hub.verify_token')
  const challenge = searchParams.get('hub.challenge')

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    console.log('✅ WhatsApp Webhook verified successfully!')
    // Meta requires the challenge to be returned as plain text
    return new NextResponse(challenge, { status: 200 })
  }

  return new NextResponse('Forbidden', { status: 403 })
}

// Handle Incoming Messages (POST request from Meta)
export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    if (body.object === 'whatsapp_business_account') {
      const entry = body.entry?.[0]
      const changes = entry?.changes?.[0]
      const value = changes?.value
      
      if (value?.messages && value?.messages[0]) {
        const message = value.messages[0]
        const senderPhone = message.from
        const text = message.text?.body
        
        console.log(`📩 Received message from ${senderPhone}: ${text || 'Interactive/Media'}`)

        // We will add the bot reply logic here next
      }
      
      return new NextResponse('EVENT_RECEIVED', { status: 200 })
    }
    
    return new NextResponse('Not a WhatsApp event', { status: 404 })
  } catch (error) {
    console.error('❌ Error processing webhook:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
