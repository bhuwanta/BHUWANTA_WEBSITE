import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const META_ACCESS_TOKEN = process.env.META_ACCESS_TOKEN!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    // 1. Fetch active Form IDs from Supabase
    const { data: forms, error: formsError } = await supabase
      .from('meta_forms')
      .select('*')

    if (formsError) throw formsError
    if (!forms || forms.length === 0) {
      return NextResponse.json({ message: 'No active forms to sync' })
    }

    let totalLeadsAdded = 0
    let syncErrors: string[] = []

    // 2. Loop through forms and fetch leads
    for (const form of forms) {
      const url = `https://graph.facebook.com/v18.0/${form.form_id}/leads?access_token=${META_ACCESS_TOKEN}&fields=created_time,id,field_data`
      
      const response = await fetch(url)
      const data = await response.json()
      
      if (!data.data || data.error) {
        const errorMsg = data.error?.message || 'Unknown error from Meta'
        console.error(`Error fetching leads for form ${form.form_id}:`, data.error)
        syncErrors.push(`Form ${form.form_id}: ${errorMsg}`)
        continue // Skip to next form
      }

      // 3. Process Leads
      for (const lead of data.data) {
        const providerId = lead.id
        
        // Extract fields
        let fullName = ''
        let email = 'no-email@meta.com'
        let phone = ''
        
        lead.field_data.forEach((field: any) => {
          const name = field.name.toLowerCase()
          const val = field.values[0]
          
          if (name.includes('name')) fullName = val
          else if (name.includes('email')) email = val
          else if (name.includes('phone')) phone = val
        })

        // Upsert lead using provider_id
        const { error: insertError } = await supabase
          .from('leads')
          .upsert({
            provider_id: providerId,
            name: fullName || 'Unknown Meta Lead',
            email: email,
            phone: phone || null,
            message: `Lead imported from Meta (Form: ${form.name || form.form_id})`,
            source_page: `Meta: ${form.name || form.form_id}`,
            status: 'new',
            created_at: lead.created_time
          }, {
            onConflict: 'provider_id',
            ignoreDuplicates: true
          })

        if (!insertError) {
          totalLeadsAdded++
        } else {
          console.error(`Error inserting lead ${providerId}:`, insertError.message)
        }
      }
    }

    return NextResponse.json({ 
      success: true, 
      processed: totalLeadsAdded,
      errors: syncErrors.length > 0 ? syncErrors : undefined 
    })
  } catch (error: any) {
    console.error('❌ Error in Meta Sync:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
