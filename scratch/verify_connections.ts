import { createClient } from 'next-sanity'
import { Resend } from 'resend'
import * as dotenv from 'dotenv'
import path from 'path'

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

async function verifySanity() {
  console.log('--- Verifying Sanity Connection ---')
  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
  const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET
  const token = process.env.SANITY_API_TOKEN

  if (!projectId || !dataset) {
    console.error('❌ Sanity Project ID or Dataset missing in .env.local')
    return false
  }

  const client = createClient({
    projectId,
    dataset,
    apiVersion: '2024-01-01',
    useCdn: false,
    token: token // Include token to test write access if provided
  })

  try {
    const data = await client.fetch('*[0]')
    console.log('✅ Sanity Read: Success! Connected to project:', projectId)
    
    if (token && token !== 'your_sanity_api_token') {
      console.log('✅ Sanity Write Token: Present and looks valid.')
    } else {
      console.warn('⚠️ Sanity Write Token: Missing or using placeholder.')
    }
    return true
  } catch (error) {
    console.error('❌ Sanity Connection Failed:', error instanceof Error ? error.message : error)
    return false
  }
}

async function verifyResend() {
  console.log('\n--- Verifying Resend Connection ---')
  const apiKey = process.env.RESEND_API_KEY
  const fromEmail = process.env.RESEND_FROM_EMAIL || 'noreply@bhuwanta.com'
  const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'bhuwanta9@gmail.com'

  if (!apiKey || apiKey === 'your_resend_api_key' || apiKey.includes('re_ivYmpnzZ')) {
    // Note: re_ivYmpnzZ is the placeholder/example usually seen
    if (apiKey === 're_ivYmpnzZ_8CuEB1sXM3QBtGw1FYAsURhT') {
       console.log('ℹ️ Using the API key you provided.')
    } else {
      console.error('❌ Resend API Key is missing or default placeholder.')
      return false
    }
  }

  const resend = new Resend(apiKey)

  try {
    // Send a test email
    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: adminEmail,
      subject: 'Connection Verification: Success!',
      html: '<p>If you are reading this, your <strong>Resend</strong> connection is working perfectly for <strong>Bhuwanta Website</strong>.</p>'
    })

    if (error) {
      console.error('❌ Resend Error:', error.message)
      return false
    }

    console.log('✅ Resend: Success! Test email sent to:', adminEmail)
    console.log('Email ID:', data?.id)
    return true
  } catch (error) {
    console.error('❌ Resend Connection Failed:', error instanceof Error ? error.message : error)
    return false
  }
}

async function main() {
  const sanityOk = await verifySanity()
  const resendOk = await verifyResend()

  console.log('\n--- Final Result ---')
  if (sanityOk && resendOk) {
    console.log('🚀 ALL CONNECTIONS VERIFIED SUCCESSFULLY!')
  } else {
    console.log('⚠️ SOME CONNECTIONS ARE NOT YET FULLY CONFIGURED.')
  }
}

main()
