import { createClient } from '@/lib/supabase/server'
import ProjectsClient from './ProjectsClient'

export const dynamic = 'force-dynamic'

export default async function ProjectsPage() {
  const supabase = await createClient()
  
  const { data: areas } = await supabase
    .from('areas')
    .select('*')
    .order('created_at', { ascending: false })

  // Fetch projects and their mapped areas using the junction table
  const { data: projects } = await supabase
    .from('projects')
    .select(`
      *,
      project_areas(
        area:areas(*)
      )
    `)
    .order('created_at', { ascending: false })

  return <ProjectsClient projects={projects || []} areas={areas || []} />
}
