import { NextResponse } from 'next/server'
import { client } from '@/lib/sanity'
import { resend } from '@/lib/resend'

// Required to make sure Next.js doesn't passively cache background cron runs
export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    // 1. Security First: Ensure absolute protection using Vercel standard auth header.
    // If testing locally, you won't have a CRON_SECRET, so uncomment the line below to bypass ONLY locally.
    const authHeader = request.headers.get('authorization')
    if (
      process.env.NODE_ENV === 'production' &&
      authHeader !== `Bearer ${process.env.CRON_SECRET}`
    ) {
      console.warn('Unauthorized cron attempt.')
      return new Response('Unauthorized', { status: 401 })
    }

    // 2. Timezone Math: Calculate exact 24hr window for "Yesterday in IST"
    // The cron will trigger around 6:00 AM IST (00:30 UTC).
    const now = new Date()
    const istOffset = 5.5 * 60 * 60 * 1000 // 5.5 hours for IST
    const nowIST = new Date(now.getTime() + istOffset)

    // Calculate start of yesterday IST (00:00:00)
    const startOfYesterdayIST = new Date(nowIST)
    startOfYesterdayIST.setDate(startOfYesterdayIST.getDate() - 1)
    startOfYesterdayIST.setUTCHours(0, 0, 0, 0)

    // Calculate end of yesterday IST (23:59:59.999)
    const endOfYesterdayIST = new Date(nowIST)
    endOfYesterdayIST.setDate(endOfYesterdayIST.getDate() - 1)
    endOfYesterdayIST.setUTCHours(23, 59, 59, 999)

    // Remap those IST boundaries cleanly back to UTC for Sanity to query accurately!
    const startOfYesterdayUTC = new Date(startOfYesterdayIST.getTime() - istOffset)
    const endOfYesterdayUTC = new Date(endOfYesterdayIST.getTime() - istOffset)

    // 3. Fetch Sanity Leads
    const query = `*[_type == "lead" && _createdAt >= $start && _createdAt <= $end] | order(_createdAt desc)`
    const leads = await client.fetch(query, {
      start: startOfYesterdayUTC.toISOString(),
      end: endOfYesterdayUTC.toISOString(),
    })

    // If there were zero leads yesterday, we safely exit so we don't spam the inbox with empty spreadsheets.
    if (!leads || leads.length === 0) {
      console.log('No leads found for yesterday. Sleeping.')
      return NextResponse.json({ success: true, message: 'No leads to report.' })
    }

    // 4. Construct the CSV Structure programmatically. 
    // This is incredibly lightweight and natively compatible with Microsoft Excel.
    const csvHeaders = 'Name,Email,Phone,Budget,Source,Status,Received Date\n'
    
    // Using string replacement on quotes to strictly preserve Excel formatting integrity
    const csvRows = leads.map((lead: any) => {
      const name = (lead.name || '').replace(/"/g, '""')
      const email = (lead.email || '').replace(/"/g, '""')
      const phone = (lead.phone || '').replace(/"/g, '""')
      const budget = (lead.budget || '').replace(/"/g, '""')
      const source = (lead.sourcePage || 'Website').replace(/"/g, '""')
      const status = (lead.status || 'new').replace(/"/g, '""')
      
      // Convert UTC creation date into readable format
      const dateStr = new Date(lead._createdAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })
      
      return `"${name}","${email}","${phone}","${budget}","${source}","${status}","${dateStr}"`
    }).join('\n')

    const csvContent = csvHeaders + csvRows
    
    // Generate precise filename
    const formattedDate = startOfYesterdayIST.toISOString().split('T')[0]
    const filename = `bhuwanta_leads_${formattedDate}.csv`

    // 5. Build and Fire the Secure Email
    // Using Buffer to smoothly stream our memory string into a physical attachment
    const attachmentContent = Buffer.from(csvContent, 'utf-8')
    const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'info@bhuwanta.com'

    if (resend) {
      await resend.emails.send({
        from: 'Bhuwanta Automation <info@bhuwanta.com>',
        to: adminEmail,
        subject: `[Bhuwanta Daily CRM] You have ${leads.length} new leads!`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px;">
            <h2 style="color: #002935;">Bhuwanta Daily Lead Report</h2>
            <p>Good morning!</p>
            <p>Attached is the automated report containing all <strong>${leads.length}</strong> new leads captured yesterday (${formattedDate}).</p>
            <p>You can seamlessly open this document using Microsoft Excel, Apple Numbers, or Google Sheets.</p>
            <br/>
            <p style="font-size: 13px; color: #5a6a82;">- Automated securely by your Bhuwanta CMS Server -</p>
          </div>
        `,
        attachments: [
          {
            filename: filename,
            content: attachmentContent,
          },
        ],
      })
    } else {
       console.error("Resend is not configured correctly.")
       return NextResponse.json({ error: 'Resend unconfigured' }, { status: 500 })
    }

    return NextResponse.json({ success: true, count: leads.length })

  } catch (err: any) {
    console.error('Fatal cron error:', err)
    return NextResponse.json(
      { error: 'Internal Server Error processing daily leads' },
      { status: 500 }
    )
  }
}
