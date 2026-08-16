'use server'

import { createServiceClient } from '@/lib/supabase/server'

export async function createAreaAction(name: string) {
  try {
    const supabaseAdmin = createServiceClient()
    const { data, error } = await supabaseAdmin
      .from('s_areas')
      .insert({ name })
      .select()
      .single()

    if (error) {
      if (error.code === '23505') {
        return { success: false, error: 'An area with this name already exists.' }
      }
      throw error
    }
    return { success: true, data, message: 'Area created successfully.' }
  } catch (error: any) {
    console.error('Error creating area:', error)
    return { success: false, error: error.message || 'Failed to create area.' }
  }
}

export async function createProjectAction(name: string, areaIds: string[], location?: string, googleMapsUrl?: string) {
  try {
    const supabaseAdmin = createServiceClient()
    
    // 1. Create the project
    const { data: project, error: projectError } = await supabaseAdmin
      .from('s_projects')
      .insert({ name, location, google_maps_url: googleMapsUrl })
      .select()
      .single()

    if (projectError) {
      if (projectError.code === '23505') {
        return { success: false, error: 'A project with this name already exists.' }
      }
      throw projectError
    }

    // 2. Map project to areas
    if (areaIds && areaIds.length > 0) {
      const mappings = areaIds.map(areaId => ({
        project_id: project.id,
        area_id: areaId
      }))

      const { error: mapError } = await supabaseAdmin
        .from('s_project_areas')
        .insert(mappings)

      if (mapError) {
        console.error('Error mapping project to areas:', mapError)
        return { success: false, error: 'Project created, but failed to map to selected areas.' }
      }
    }

    return { success: true, message: 'Project created and mapped successfully.' }
  } catch (error: any) {
    console.error('Error creating project:', error)
    return { success: false, error: error.message || 'Failed to create project.' }
  }
}

export async function getAreasAction() {
  try {
    const supabaseAdmin = createServiceClient()
    const { data, error } = await supabaseAdmin
      .from('s_areas')
      .select('*')
      .order('name', { ascending: true })

    if (error) throw error
    return { success: true, data: data || [] }
  } catch (error) {
    console.error('Error fetching areas:', error)
    return { success: false, data: [] }
  }
}

export async function getProjectsAction() {
  try {
    const supabaseAdmin = createServiceClient()
    
    // Fetch projects with their mapped areas
    const { data, error } = await supabaseAdmin
      .from('s_projects')
      .select(`
        id,
        name,
        location,
        google_maps_url,
        created_at,
        s_project_areas (
          s_areas (
            id,
            name
          )
        )
      `)
      .order('name', { ascending: true })

    if (error) throw error
    return { success: true, data: data || [] }
  } catch (error) {
    console.error('Error fetching projects:', error)
    return { success: false, data: [] }
  }
}
