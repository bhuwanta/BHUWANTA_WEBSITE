import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { contactRateLimiter } from '@/lib/redis'
import { sendContactNotification, sendLeadAcknowledgement } from '@/lib/resend'

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
    const { name, email, phone, message, propertyInterest, sourcePage } = body

    // Validation
    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'Name, email, and message are required.' },
        { status: 400 }
      )
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: 'Please provide a valid email address.' },
        { status: 400 }
      )
    }

    // Insert into Supabase
    const supabase = createServiceClient()
    const { error: dbError } = await supabase.from('leads').insert({
      name,
      email,
      phone: phone || null,
      message,
      property_interest: propertyInterest || null,
      source_page: sourcePage || 'contact',
      status: 'new',
    })

    if (dbError) {
      console.error('Supabase insert error:', dbError)
      return NextResponse.json(
        { error: 'Failed to save your message. Please try again.' },
        { status: 500 }
      )
    }

    // Send emails (non-blocking, don't fail the request)
    try {
      await Promise.all([
        sendContactNotification({ name, email, phone, message, propertyInterest, sourcePage }),
        sendLeadAcknowledgement(email, name),
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
