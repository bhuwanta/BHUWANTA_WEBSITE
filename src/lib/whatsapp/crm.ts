import { createClient } from '@supabase/supabase-js'

// We use the service role key to bypass RLS for webhook operations
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

export async function upsertWhatsAppLead(phone: string, name: string) {
  try {
    // Try to find existing lead with this phone
    const { data: existingLead } = await supabase
      .from('leads')
      .select('id')
      .eq('phone', phone)
      .single()

    if (existingLead) {
      // Lead already exists, just return it
      return existingLead
    }

    // Create new lead — email and message are NOT NULL in the DB
    const { data: newLead, error } = await supabase
      .from('leads')
      .insert({
        name,
        phone,
        email: `${phone}@whatsapp.lead`,
        message: 'Enquiry via WhatsApp Bot',
        source_page: 'WhatsApp Bot',
        status: 'new'
      })
      .select()
      .single()

    if (error) throw error
    return newLead

  } catch (error) {
    console.error('Error in upsertWhatsAppLead:', error)
    return null
  }
}

export async function logLeadActivity(phone: string, action: string, details: string) {
  try {
    const { data: lead } = await supabase
      .from('leads')
      .select('id')
      .eq('phone', phone)
      .single()

    if (lead) {
      // If we have an activities or notes table, we'd insert here. 
      // For now, we update the status or a specific field if necessary.
      // E.g., we could append to a "notes" column if it exists.
      console.log(`[CRM] Logged activity for ${phone}: ${action} - ${details}`)
    }
  } catch (error) {
    console.error('Error in logLeadActivity:', error)
  }
}

export async function triggerSalesNotification(phone: string, project: string) {
  // Here we can trigger an email via Resend to the sales team
  // For now we just log it
  console.log(`[ALERT] Sales team notified for callback request from ${phone} regarding ${project}`)
}
