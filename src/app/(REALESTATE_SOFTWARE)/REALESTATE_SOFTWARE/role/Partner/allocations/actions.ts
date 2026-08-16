'use server'

import { createServiceClient } from '@/lib/supabase/server'

// Fetch Areas and Projects
export async function getAreasAndProjectsAction() {
  try {
    const supabaseAdmin = createServiceClient()
    const { data: areas, error: areaError } = await supabaseAdmin
      .from('s_areas')
      .select('id, name')
      .order('name')
    
    const { data: projects, error: projError } = await supabaseAdmin
      .from('s_projects')
      .select(`
        id, name,
        s_project_areas!inner(area_id)
      `)
      .order('name')

    if (areaError || projError) throw new Error('Failed to fetch areas/projects')

    return { success: true, areas, projects }
  } catch (error: any) {
    console.error(error)
    return { success: false, areas: [], projects: [] }
  }
}

// Upload parsed Excel Inventory
export async function uploadInventoryAction(projectId: string, plots: any[]) {
  try {
    const supabaseAdmin = createServiceClient()
    
    // Format plots for insertion
    const insertData = plots.map(p => ({
      project_id: projectId,
      plot_number: String(p['Plot No.'] || p['Plot Number'] || p.plot_number),
      size_sqft: parseFloat(p['Size SqFt'] || p['Size (SqFt)'] || p.size_sqft || 0),
      total_price: parseFloat(p['Total Price'] || p.total_price || 0),
      min_token_advance: parseFloat(p['Min Token Advance'] || p.min_token_advance || 0),
      dimensions: p['Dimensions'] || p.dimensions || null,
      facing: p['Facing'] || p.facing || null,
      status: 'available'
    })).filter(p => p.plot_number && p.size_sqft > 0 && p.total_price > 0)

    if (insertData.length === 0) {
      return { success: false, error: 'No valid plots found in the data.' }
    }

    const { error } = await supabaseAdmin
      .from('s_inventory_plots')
      .insert(insertData)

    if (error) throw error

    return { success: true, message: `Successfully added ${insertData.length} plots.` }
  } catch (error: any) {
    console.error('Upload error:', error)
    return { success: false, error: error.message || 'Failed to upload inventory.' }
  }
}

// Fetch Inventory (Unallocated and Allocated)
export async function getProjectInventoryAction(projectId: string) {
  try {
    const supabaseAdmin = createServiceClient()
    const { data, error } = await supabaseAdmin
      .from('s_inventory_plots')
      .select(`
        *,
        s_wings (
          id,
          wing_budget_percentage,
          s_realestate_users (id, full_name)
        )
      `)
      .eq('project_id', projectId)
      .order('plot_number')

    if (error) throw error

    // Separate into unallocated and allocated
    const unallocated = data.filter((p: any) => !p.assigned_wing_id)
    const allocated = data.filter((p: any) => p.assigned_wing_id)

    // Group allocated by wing leader
    const allocatedByLeader = allocated.reduce((acc: Record<string, any[]>, plot: any) => {
      const leaderName = plot.s_wings?.s_realestate_users?.full_name || 'Unknown'
      const budgetPct = plot.s_wings?.wing_budget_percentage || 0
      const groupKey = `${leaderName} (${budgetPct}%)`
      if (!acc[groupKey]) acc[groupKey] = []
      acc[groupKey].push(plot)
      return acc
    }, {} as Record<string, any[]>)

    return { success: true, unallocated, allocatedByLeader }
  } catch (error: any) {
    console.error(error)
    return { success: false, unallocated: [], allocatedByLeader: {} }
  }
}

// Get Wing Leaders
export async function getWingLeadersAction() {
  try {
    const supabaseAdmin = createServiceClient()
    const { data, error } = await supabaseAdmin
      .from('s_realestate_users')
      .select('id, full_name')
      .eq('role', 'wing_leader')
      .order('full_name')

    if (error) throw error
    return { success: true, data: data || [] }
  } catch (error: any) {
    console.error(error)
    return { success: false, data: [] }
  }
}

// Allocate Plots
export async function allocatePlotsAction(plotIds: string[], wingLeaderId: string, percentage: number) {
  try {
    const supabaseAdmin = createServiceClient()
    
    // 1. Get or Create Wing for this leader with this specific percentage
    let wingId = ''
    const { data: existingWing } = await supabaseAdmin
      .from('s_wings')
      .select('id')
      .eq('wing_leader_id', wingLeaderId)
      .eq('wing_budget_percentage', percentage)
      .maybeSingle()
      
    if (existingWing) {
      wingId = existingWing.id
    } else {
      const { data: newWing, error: wingError } = await supabaseAdmin
        .from('s_wings')
        .insert({ wing_leader_id: wingLeaderId, wing_budget_percentage: percentage })
        .select()
        .single()
      if (wingError) throw wingError
      wingId = newWing.id
    }

    // 2. Update plots
    const { error: updateError } = await supabaseAdmin
      .from('s_inventory_plots')
      .update({ assigned_wing_id: wingId })
      .in('id', plotIds)

    if (updateError) throw updateError

    return { success: true, message: 'Plots allocated successfully.' }
  } catch (error: any) {
    console.error('Allocation error:', error)
    return { success: false, error: 'Failed to allocate plots.' }
  }
}
