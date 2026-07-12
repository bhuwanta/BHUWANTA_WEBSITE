import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const META_ACCESS_TOKEN = process.env.META_ACCESS_TOKEN!
// This is the secret token you'll put into the Meta Developer Dashboard when subscribing to webhooks.
const META_WEBHOOK_VERIFY_TOKEN = process.env.META_WEBHOOK_VERIFY_TOKEN || 'bhuwanta_realtime_leads_2026'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

export const dynamic = 'force-dynamic'

// 1. GET Request: Meta uses this to verify the webhook when you first set it up
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const mode = searchParams.get('hub.mode')
  const token = searchParams.get('hub.verify_token')
  const challenge = searchParams.get('hub.challenge')

  if (mode === 'subscribe' && token === META_WEBHOOK_VERIFY_TOKEN) {
    console.log('✅ Meta Webhook Verified!')
    // Meta requires the challenge to be returned exactly as received, in plain text
    return new NextResponse(challenge, { status: 200 })
  } else {
    console.error('❌ Webhook verification failed. Token mismatch.')
    return new NextResponse('Forbidden', { status: 403 })
  }
}

// 2. POST Request: Meta sends the lead data here the exact millisecond a form is submitted
export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    // Check if this is a Page event (Leadgen events come from Facebook Pages)
    if (body.object === 'page') {
      for (const entry of body.entry) {
        for (const change of entry.changes) {
          // We only care about leadgen events
          if (change.field === 'leadgen') {
            const leadgenId = change.value.leadgen_id
            const formId = change.value.form_id
            
            console.log(`🔔 New real-time lead detected! ID: ${leadgenId}`)

            // Look up the form name in our database (optional, for better CRM context)
            const { data: form } = await supabase
              .from('meta_forms')
              .select('*')
              .eq('form_id', formId)
              .single()

            const formName = form?.name || formId

            // Meta only sends the lead ID in the webhook payload for security. 
            // We have to securely fetch the actual lead details using our access token.
            const url = `https://graph.facebook.com/v18.0/${leadgenId}?access_token=${META_ACCESS_TOKEN}&fields=created_time,id,field_data`
            const response = await fetch(url)
            const leadData = await response.json()

            if (leadData.error) {
              console.error('❌ Error fetching lead details from Graph API:', leadData.error)
              continue
            }

            // Process the fields just like our cron job does
            let fullName = ''
            let email = 'no-email@meta.com'
            let phone = ''
            
            if (leadData.field_data) {
              leadData.field_data.forEach((field: any) => {
                const name = field.name.toLowerCase()
                const val = field.values[0]
                
                if (name.includes('name')) fullName = val
                else if (name.includes('email')) email = val
                else if (name.includes('phone')) phone = val
              })
            }

            // Insert immediately into Supabase
            const { error: insertError } = await supabase
              .from('leads')
              .upsert({
                provider_id: leadData.id,
                name: fullName || 'Unknown Meta Lead',
                email: email,
                phone: phone || null,
                message: `Lead imported via Real-Time Webhook (Form: ${formName})`,
                source_page: `Meta: ${formName}`,
                status: 'new',
                created_at: leadData.created_time
              }, {
                onConflict: 'provider_id',
                ignoreDuplicates: true
              })

            if (insertError) {
              console.error(`❌ Error inserting webhook lead ${leadData.id}:`, insertError.message)
            } else {
              console.log(`✅ Successfully saved real-time lead: ${fullName}`)
            }
          }
        }
      }
      // You must return a 200 OK immediately so Meta knows we got it
      return new NextResponse('EVENT_RECEIVED', { status: 200 })
    }
    
    return new NextResponse('Not a page event', { status: 404 })
  } catch (error: any) {
    console.error('❌ Webhook Execution Error:', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}
