import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { contactRateLimiter } from '@/lib/redis'
import { sendContactNotification, resend } from '@/lib/resend'
import { client, autoresponderQuery, writeClient } from '@/lib/sanity'

async function sendDynamicAutoresponder(toName: string, toEmail: string) {
  if (!resend) return

  try {
    // Fetch settings from Sanity
    const settings = await client.fetch(autoresponderQuery)
    if (!settings) return

    const { fromName, fromEmail, subjectLine, messageBody, logoUrl, attachmentUrl, attachmentFilename } = settings

    // Construct highly professional HTML
    const html = `
      <div style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        ${logoUrl ? `<img src="${logoUrl}" alt="${fromName}" style="max-height: 50px; margin-bottom: 24px;" />` : ''}
        <h2 style="color: #002935; font-size: 20px; font-weight: 600; margin-bottom: 16px;">Hello ${toName},</h2>
        <div style="color: #5a6a82; line-height: 1.6; font-size: 15px; white-space: pre-wrap;">${messageBody}</div>
        <br/>
        <div style="margin-top: 32px; padding-top: 24px; border-top: 1px solid #e8ecf2;">
          <p style="color: #002935; font-size: 14px; margin: 0;">Best regards,</p>
          <p style="color: #7D651F; font-weight: 600; font-size: 14px; margin: 4px 0 0 0;">${fromName}</p>
        </div>
      </div>
    `

    // Process optional PDF attachment directly from Sanity CDN
    const attachments = []
    if (attachmentUrl) {
      try {
        const pdfRes = await fetch(attachmentUrl)
        const pdfBuffer = Buffer.from(await pdfRes.arrayBuffer())
        attachments.push({
          filename: attachmentFilename || 'Bhuwanta_Brochure.pdf',
          content: pdfBuffer,
        })
      } catch (e) {
        console.error('Failed to attach PDF buffer:', e)
      }
    }

    // Send the email
    await resend.emails.send({
      from: `${fromName || 'Bhuwanta'} <${fromEmail || 'info@bhuwanta.com'}>`,
      to: toEmail,
      subject: subjectLine || 'Thank you for contacting us',
      html,
      attachments: attachments.length > 0 ? attachments : undefined
    })
  } catch (err) {
    console.error('Failed to send dynamic autoresponder:', err)
  }
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    if (contactRateLimiter) {
      const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
      const { success, remaining } = await contactRateLimiter.limit(ip)
      if (!success) {
        return NextResponse.json(
          { error: 'Too many requests. Please try again later.' },
          { status: 429, headers: { 'X-RateLimit-Remaining': remaining.toString() } }
        )
      }
    }

    const body = await request.json()
    const { name, email, phone, budget, sourcePage } = body

    // Validation
    if (!name || !email || !phone || !budget) {
      return NextResponse.json(
        { error: 'Name, email, phone, and budget are required.' },
        { status: 400 }
      )
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: 'Please provide a valid email address.' },
        { status: 400 }
      )
    }

    // Insert into Sanity (Primary CRM)
    try {
      await writeClient.create({
        _type: 'lead',
        name,
        email,
        phone: phone || '',
        budget: budget || '',
        sourcePage: sourcePage || 'Website',
        status: 'new',
      })
    } catch (dbError) {
      console.error('Sanity insert error:', dbError)
      return NextResponse.json(
        { error: 'Failed to save your message. Please try again.' },
        { status: 500 }
      )
    }

    // Backup into Supabase (Safety net — non-blocking)
    try {
      const supabase = createServiceClient()
      await supabase.from('leads').insert({
        name,
        email,
        phone: phone || null,
        message: budget || '',
        source_page: sourcePage || 'Website',
        status: 'new',
      })
    } catch (backupErr) {
      console.error('Supabase backup insert failed (non-critical):', backupErr)
    }

    // Send emails (non-blocking, don't fail the request)
    try {
      await Promise.all([
        sendContactNotification({ name, email, phone, budget, sourcePage }),
        sendDynamicAutoresponder(name, email), // Call our new Sanity-driven function
      ])
    } catch (emailError) {
      console.error('Email send error:', emailError)
      // Don't fail the request, lead is saved
    }

    return NextResponse.json({ success: true, message: 'Message sent successfully!' })
  } catch (error) {
    console.error('Contact API error:', error)
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    )
  }
}
