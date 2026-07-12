import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const WEBHOOK_SECRET = process.env.GOOGLE_ADS_WEBHOOK_SECRET || 'bhuwanta_google_ads_2026'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

export async function POST(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const googleKey = searchParams.get('google_key')

    // 1. Authenticate Request
    if (googleKey !== WEBHOOK_SECRET) {
      console.error('❌ Unauthorized Google Ads Webhook request')
      return new NextResponse('Unauthorized', { status: 401 })
    }

    // 2. Parse Payload
    const body = await request.json()
    console.log('📩 Received Google Ads Lead Payload:', JSON.stringify(body, null, 2))

    /* 
      Google Ads sends data in this format:
      {
        "lead_id": "TeSt12345",
        "user_column_data": [
          { "column_name": "FIRST_NAME", "string_value": "John" },
          { "column_name": "LAST_NAME", "string_value": "Doe" },
          { "column_name": "PHONE_NUMBER", "string_value": "+11234567890" },
          { "column_name": "EMAIL", "string_value": "john.doe@example.com" },
          { "column_name": "CITY", "string_value": "New York" }
        ],
        "api_version": "1.0",
        "form_id": 123456789,
        "campaign_id": 987654321,
        "is_test": true
      }
    */

    const columnData = body.user_column_data || []
    
    // Map generic fields
    let firstName = ''
    let lastName = ''
    let fullName = ''
    let phone = ''
    let email = 'no-email@googleads.com' // Fallback
    
    // Extra fields to store in message
    const extraFields: Record<string, string> = {}

    columnData.forEach((item: any) => {
      const key = item.column_name
      const value = item.string_value
      
      if (key === 'FIRST_NAME') firstName = value
      else if (key === 'LAST_NAME') lastName = value
      else if (key === 'FULL_NAME') fullName = value
      else if (key === 'PHONE_NUMBER') phone = value
      else if (key === 'EMAIL') email = value
      else extraFields[key] = value // Store any extra survey questions here
    })

    // Construct Name
    const finalName = fullName || `${firstName} ${lastName}`.trim() || 'Unknown Lead'
    
    // Construct Message block with extra campaign info
    let messageBody = `Lead from Google Ads (Campaign ID: ${body.campaign_id || 'Unknown'})`
    if (Object.keys(extraFields).length > 0) {
      messageBody += `\n\nExtra Info:\n`
      for (const [k, v] of Object.entries(extraFields)) {
        messageBody += `- ${k}: ${v}\n`
      }
    }

    // 3. Insert into Supabase
    const { error } = await supabase
      .from('leads')
      .insert({
        name: finalName,
        phone: phone || null,
        email: email,
        message: messageBody,
        source_page: 'Google Ads',
        status: 'new'
      })

    if (error) throw error

    return new NextResponse('Lead Captured Successfully', { status: 200 })
  } catch (error) {
    console.error('❌ Error processing Google Ads webhook:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
