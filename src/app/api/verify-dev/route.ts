import { NextRequest, NextResponse } from 'next/server'
import { createClient } from 'next-sanity'
import { Resend } from 'resend'

export async function GET(request: NextRequest) {
  const results = {
    sanity: { status: 'pending', message: '' },
    resend: { status: 'pending', message: '' },
  }

  // 1. Verify Sanity
  try {
    const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
    const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET
    const token = process.env.SANITY_API_TOKEN

    const client = createClient({
      projectId,
      dataset,
      apiVersion: '2024-01-01',
      useCdn: false,
      token: token
    })

    const data = await client.fetch('*[0]')
    results.sanity = { 
      status: 'success', 
      message: `Connected to Sanity Project: ${projectId}. Data fetch working.` 
    }
  } catch (error) {
    results.sanity = { 
      status: 'error', 
      message: `Sanity Error: ${error instanceof Error ? error.message : 'Unknown error'}` 
    }
  }

  // 2. Verify Resend
  try {
    const apiKey = process.env.RESEND_API_KEY
    const fromEmail = process.env.RESEND_FROM_EMAIL || 'noreply@bhuwanta.com'
    const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'bhuwanta9@gmail.com'

    if (!apiKey || apiKey === 'your_resend_api_key') {
      throw new Error('Resend API key is missing or set to placeholder.')
    }

    const resend = new Resend(apiKey)
    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: adminEmail,
      subject: 'Bhuwanta: Connection Verification Success!',
      html: `
        <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <h2 style="color: #002935;">Everything looks good!</h2>
          <p>Your <strong>Resend</strong> and <strong>Sanity</strong> connections are now working correctly.</p>
          <ul style="color: #5a6a82;">
            <li><strong>Sanity</strong>: Fetching data... ✅</li>
            <li><strong>Resend</strong>: Sending emails... ✅</li>
          </ul>
          <p>You can now delete the <code>/api/verify-dev</code> route.</p>
        </div>
      `
    })

    if (error) throw error

    results.resend = { 
      status: 'success', 
      message: `Test email sent to ${adminEmail}. Check your inbox!` 
    }
  } catch (error) {
    results.resend = { 
      status: 'error', 
      message: `Resend Error: ${error instanceof Error ? error.message : 'Unknown error'}` 
    }
  }

  return NextResponse.json(results)
}
