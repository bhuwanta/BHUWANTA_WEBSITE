import { NextResponse } from 'next/server'
import { getSession, setSession, clearSession, ConversationStep } from '@/lib/whatsapp/state'
import { upsertWhatsAppLead, logLeadActivity, triggerSalesNotification } from '@/lib/whatsapp/crm'
import { getActiveAreas, getProjectsByArea, getProjectDetails } from '@/lib/whatsapp/sanity'

const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || 'bhuwanta_verify_2026'
const ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN
const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID

// Send a basic text message
async function sendTextMessage(to: string, body: string) {
  if (!ACCESS_TOKEN || !PHONE_NUMBER_ID) return;
  const res = await fetch(`https://graph.facebook.com/v18.0/${PHONE_NUMBER_ID}/messages`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${ACCESS_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to,
      type: 'text',
      text: { body }
    })
  })
  if (!res.ok) console.error('Failed to send text message:', await res.text())
}

// Send an Interactive List Menu
async function sendListMenu(to: string, header: string, body: string, buttonText: string, options: { id: string, title: string, description?: string }[]) {
  if (!ACCESS_TOKEN || !PHONE_NUMBER_ID) { console.error('❌ Missing ACCESS_TOKEN or PHONE_NUMBER_ID'); return; }
  
  // WhatsApp lists require rows grouped by sections
  const rows = options.slice(0, 10).map(opt => ({
    id: opt.id,
    title: opt.title.slice(0, 24),
    ...(opt.description ? { description: opt.description.slice(0, 72) } : {})
  }))

  const payload = {
    messaging_product: 'whatsapp',
    to,
    type: 'interactive',
    interactive: {
      type: 'list',
      header: { type: 'text', text: header.slice(0, 60) },
      body: { text: body.slice(0, 1024) },
      action: {
        button: buttonText.slice(0, 20),
        sections: [{ title: 'Options', rows }]
      }
    }
  }
  console.log('📦 List menu payload:', JSON.stringify(payload, null, 2))

  const res = await fetch(`https://graph.facebook.com/v18.0/${PHONE_NUMBER_ID}/messages`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${ACCESS_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  })
  const responseText = await res.text()
  console.log('📨 Meta API response:', res.status, responseText)
  if (!res.ok) console.error('❌ Failed to send list menu:', responseText)
}

// Send Interactive Buttons (Max 3)
async function sendButtonsMenu(to: string, body: string, buttons: { id: string, title: string }[]) {
  if (!ACCESS_TOKEN || !PHONE_NUMBER_ID) return;

  const buttonsArray = buttons.slice(0, 3).map(btn => ({
    type: 'reply',
    reply: {
      id: btn.id,
      title: btn.title.slice(0, 20)
    }
  }))

  const res = await fetch(`https://graph.facebook.com/v18.0/${PHONE_NUMBER_ID}/messages`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${ACCESS_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to,
      type: 'interactive',
      interactive: {
        type: 'button',
        body: { text: body.slice(0, 1024) },
        action: { buttons: buttonsArray }
      }
    })
  })
  if (!res.ok) console.error('Failed to send buttons menu:', await res.text())
}

// Send Document Message
async function sendDocumentMessage(to: string, documentUrl: string, filename: string) {
  if (!ACCESS_TOKEN || !PHONE_NUMBER_ID) return;
  const res = await fetch(`https://graph.facebook.com/v18.0/${PHONE_NUMBER_ID}/messages`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${ACCESS_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to,
      type: 'document',
      document: {
        link: documentUrl,
        filename
      }
    })
  })
  if (!res.ok) console.error('Failed to send document:', await res.text())
}


// Handle Webhook Verification (GET request from Meta)
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  
  const mode = searchParams.get('hub.mode')
  const token = searchParams.get('hub.verify_token')
  const challenge = searchParams.get('hub.challenge')

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    console.log('✅ WhatsApp Webhook verified successfully!')
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
      
      // Acknowledge read or status updates without action
      if (value?.statuses) return new NextResponse('EVENT_RECEIVED', { status: 200 })

      if (value?.messages && value?.messages[0]) {
        const message = value.messages[0]
        const senderPhone = message.from
        
        // Extract WhatsApp Profile Name if available
        const profileName = value.contacts?.[0]?.profile?.name || 'WhatsApp User'
        
        // Extract User Input (Text or Interactive Response)
        let userInput = ''
        let isGreeting = false

        if (message.type === 'text') {
          userInput = message.text.body.trim()
          if (userInput.toLowerCase().startsWith('hi') || userInput.toLowerCase().startsWith('hello')) {
            isGreeting = true
          }
        } else if (message.type === 'interactive') {
          if (message.interactive.type === 'list_reply') {
            userInput = message.interactive.list_reply.id
          } else if (message.interactive.type === 'button_reply') {
            userInput = message.interactive.button_reply.id
          }
        }

        console.log(`📩 Received from ${senderPhone}: ${userInput}`)

        // 1. Get or Create Session
        let session = await getSession(senderPhone, profileName)

        // 2. Restart flow if user says "hi" or it's a completely new session
        if (isGreeting || session.step === 'INIT') {
          console.log('🔄 Starting greeting flow for', senderPhone)
          
          const leadResult = await upsertWhatsAppLead(senderPhone, profileName)
          console.log('💾 Lead upsert result:', leadResult ? 'OK' : 'FAILED (but continuing)')
          
          const areas = await getActiveAreas()
          console.log('🗺️ Areas from Sanity:', JSON.stringify(areas))
          
          if (areas.length === 0) {
            console.log('⚠️ No areas found, sending fallback text')
            await sendTextMessage(senderPhone, "👋 Welcome to Bhuwanta Projects!\n\nCurrently, we don't have any active projects listed. Please check back later.")
            return new NextResponse('EVENT_RECEIVED', { status: 200 })
          }

          const options = areas.map(area => ({ id: `area_${area}`, title: area }))
          console.log('📤 Sending list menu with options:', JSON.stringify(options))
          
          await sendListMenu(
            senderPhone, 
            "Bhuwanta Projects", 
            "👋 Welcome to Bhuwanta Projects.\n\nPlease choose the area you're interested in.",
            "Select Area",
            options
          )
          console.log('✅ List menu sent successfully')

          session.step = 'AWAITING_AREA'
          await setSession(senderPhone, session)
          return new NextResponse('EVENT_RECEIVED', { status: 200 })
        }

        // 3. Handle Area Selection
        if (session.step === 'AWAITING_AREA' && userInput.startsWith('area_')) {
          const selectedArea = userInput.replace('area_', '')
          const projects = await getProjectsByArea(selectedArea)

          if (projects.length === 0) {
            await sendTextMessage(senderPhone, `Sorry, we couldn't find any projects in ${selectedArea}.`)
            return new NextResponse('EVENT_RECEIVED', { status: 200 })
          }

          const options = projects.map((p: any) => ({ id: `proj_${p.name}`, title: p.name, description: p.location }))
          await sendListMenu(
            senderPhone,
            `${selectedArea} Projects`,
            `Great! Here are our projects in ${selectedArea}. Please select one to view details.`,
            "Select Project",
            options
          )

          session.selectedArea = selectedArea
          session.step = 'AWAITING_PROJECT'
          await setSession(senderPhone, session)
          return new NextResponse('EVENT_RECEIVED', { status: 200 })
        }

        // 4. Handle Project Selection
        if (session.step === 'AWAITING_PROJECT' && userInput.startsWith('proj_')) {
          const selectedProjectName = userInput.replace('proj_', '')
          
          const buttons = [
            { id: `action_brochure_${selectedProjectName}`, title: "📄 Brochure" },
            { id: `action_layout_${selectedProjectName}`, title: "🏗 Layout" },
            { id: `action_callback_${selectedProjectName}`, title: "📞 Request Callback" }
          ]

          await sendButtonsMenu(
            senderPhone,
            `You selected *${selectedProjectName}*.\n\nWhat would you like to do next?`,
            buttons
          )

          session.selectedProject = selectedProjectName
          session.step = 'AWAITING_ACTION'
          await setSession(senderPhone, session)
          return new NextResponse('EVENT_RECEIVED', { status: 200 })
        }

        // 5. Handle Final Action (Brochure, Layout, Callback)
        if (session.step === 'AWAITING_ACTION' && userInput.startsWith('action_')) {
          const action = userInput.split('_')[1] // 'brochure', 'layout', 'callback'
          const projectName = userInput.split('_').slice(2).join('_')
          
          if (action === 'callback') {
            await triggerSalesNotification(senderPhone, projectName)
            await logLeadActivity(senderPhone, 'Requested Callback', projectName)
            await sendTextMessage(senderPhone, "Thank you! A sales executive will contact you shortly regarding " + projectName + ".\n\nType 'Hi' anytime to start over.")
            await clearSession(senderPhone)
          } 
          else if (action === 'brochure' || action === 'layout') {
            const projectDetails = await getProjectDetails(projectName)
            
            if (action === 'brochure' && projectDetails?.brochureUrl) {
              await sendDocumentMessage(senderPhone, projectDetails.brochureUrl, `${projectName} Brochure.pdf`)
              await logLeadActivity(senderPhone, 'Downloaded Brochure', projectName)
            } else if (action === 'layout' && projectDetails?.layoutUrl) {
              await sendDocumentMessage(senderPhone, projectDetails.layoutUrl, `${projectName} Layout.pdf`)
              await logLeadActivity(senderPhone, 'Downloaded Layout', projectName)
            } else {
              await sendTextMessage(senderPhone, "Sorry, this document is currently unavailable.")
            }
            
            // Allow them to choose another action for the same project
            setTimeout(async () => {
              const buttons = [
                { id: `action_callback_${projectName}`, title: "📞 Request Callback" },
                { id: `start_over`, title: "🔄 Start Over" }
              ]
              await sendButtonsMenu(senderPhone, "Is there anything else I can help you with?", buttons)
            }, 2000)
          }
          return new NextResponse('EVENT_RECEIVED', { status: 200 })
        }

        // 6. Handle "Start Over"
        if (userInput === 'start_over') {
          await clearSession(senderPhone)
          await sendTextMessage(senderPhone, "Session restarted. Type 'Hi' to see our projects again.")
          return new NextResponse('EVENT_RECEIVED', { status: 200 })
        }

        // Fallback for unknown input
        await sendTextMessage(senderPhone, "I didn't quite get that. Type 'Hi' to explore our projects!")
      }
      
      return new NextResponse('EVENT_RECEIVED', { status: 200 })
    }
    
    return new NextResponse('Not a WhatsApp event', { status: 404 })
  } catch (error) {
    console.error('❌ Error processing webhook:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
