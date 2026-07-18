import { getLeads } from './actions'
import LeadsClient from './LeadsClient'
import { createClient } from '@/lib/supabase/server'

export default async function LeadsPage() {
  const initialLeads = await getLeads()
  
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const userRole = user?.user_metadata?.role || 'Admin'

  return (
    <div className="w-full">
      <LeadsClient initialLeads={initialLeads} userRole={userRole} />
    </div>
  )
}
