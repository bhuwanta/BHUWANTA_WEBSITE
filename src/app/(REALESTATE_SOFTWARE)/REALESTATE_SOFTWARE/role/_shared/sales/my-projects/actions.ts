'use server'

import { createServiceClient } from '@/lib/supabase/server'
import { verifyCaller } from '../../auth'
import { findUplineDirectorId } from '../../downline'

/**
 * §5: "A Director's whole downline inherits his Project assignments."
 * Read-only for everyone below Director — resolves the caller's own
 * upline Director (themselves if they already are one), then returns
 * every Project assigned to that Director via S_director_projects. Also
 * used to populate the Project dropdown on the New Registration form —
 * a seller can only submit against a Project their Director is actually
 * assigned to.
 */
export async function getMyProjectsAction() {
  try {
    const caller = await verifyCaller()
    if (!caller) return { success: false, data: [] as any[], error: 'Not authenticated.' }

    const supabaseAdmin = createServiceClient()
    const directorId = await findUplineDirectorId(supabaseAdmin, caller.id, caller.role)
    if (!directorId) return { success: true, data: [] as any[] }

    const { data, error } = await supabaseAdmin
      .from('s_director_projects')
      .select(`
        s_projects (
          id, name, location, google_maps_url, base_price, mrp_default,
          s_areas ( id, name )
        )
      `)
      .eq('director_id', directorId)

    if (error) throw error

    const projects = (data || []).map((row: any) => row.s_projects).filter(Boolean)
    return { success: true, data: projects }
  } catch (error: any) {
    console.error('Error fetching my projects:', error)
    return { success: false, data: [] as any[], error: error.message }
  }
}
