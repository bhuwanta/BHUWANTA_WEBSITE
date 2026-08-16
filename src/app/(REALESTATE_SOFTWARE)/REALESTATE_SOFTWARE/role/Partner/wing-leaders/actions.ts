'use server'

import { createClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'

function createServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function getWingLeaderStatsAction() {
  try {
    const supabaseAdmin = createServiceClient()
    
    // Fetch from our new SQL View
    const { data, error } = await supabaseAdmin
      .from('v_wing_leader_stats')
      .select('*')
      .order('wing_leader_name')

    if (error) throw error
    return { success: true, data }
  } catch (error: any) {
    console.error(error)
    return { success: false, data: [] }
  }
}

export async function getWingLeaderPlotsAction(wingId: string, projectId: string | null = null) {
  try {
    const supabaseAdmin = createServiceClient()
    
    let query = supabaseAdmin
      .from('s_inventory_plots')
      .select(`
        *,
        s_projects (name)
      `)
      .eq('assigned_wing_id', wingId)
      .order('plot_number')

    if (projectId) {
      query = query.eq('project_id', projectId)
    }

    const { data, error } = await query

    if (error) throw error
    return { success: true, data }
  } catch (error: any) {
    console.error(error)
    return { success: false, data: [] }
  }
}

export async function deassignPlotAction(plotId: string) {
  try {
    const supabaseAdmin = createServiceClient()
    const { error } = await supabaseAdmin
      .from('s_inventory_plots')
      .update({ assigned_wing_id: null })
      .eq('id', plotId)

    if (error) throw error

    revalidatePath('/role/Partner/wing-leaders')
    revalidatePath('/role/Partner/allocations')
    return { success: true }
  } catch (error: any) {
    console.error(error)
    return { success: false, error: error.message }
  }
}
