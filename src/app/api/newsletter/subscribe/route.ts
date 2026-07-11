import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: Request) {
  try {
    const { email } = await req.json()

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Valid email is required' }, { status: 400 })
    }

    const supabase = await createClient()

    // Since we're inserting without auth, this depends on the RLS policy we set up
    // However, server side functions generally bypass RLS if we use the service role key.
    // For this, we'll just insert as the public user (which is allowed by our RLS policy).
    const { data, error } = await supabase
      .from('subscribers')
      .insert([{ email }])
      .select()
      .single()

    if (error) {
      if (error.code === '23505') {
        // Unique violation (email already exists)
        return NextResponse.json({ message: 'You are already subscribed!' })
      }
      console.error('Newsletter subscription error:', error)
      return NextResponse.json({ error: 'Failed to subscribe' }, { status: 500 })
    }

    return NextResponse.json({ message: 'Successfully subscribed!', data })
  } catch (error: any) {
    console.error('Newsletter POST error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
