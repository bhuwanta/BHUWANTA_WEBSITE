'use server'

import { createClient } from '@/lib/supabase/server'

export async function getWhatsappLeadsWithActivity() {
  const supabase = await createClient()
  
  // Fetch leads where source_page contains whatsapp, and join their activities
  const { data, error } = await supabase
    .from('leads')
    .select(`
      *,
      lead_activities (*)
    `)
    .ilike('source_page', '%whatsapp%')
    .order('updated_at', { ascending: false })

  if (error) {
    console.error('Error fetching whatsapp leads:', error)
    return { data: [], error: 'Failed to fetch WhatsApp leads' }
  }

  // Ensure activities are ordered by created_at ascending (chronological) for each lead
  const formattedData = data.map((lead: any) => {
    if (lead.lead_activities) {
      lead.lead_activities.sort((a: any, b: any) => 
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      )
    }
    return lead
  })

  return { data: formattedData, error: null }
}
