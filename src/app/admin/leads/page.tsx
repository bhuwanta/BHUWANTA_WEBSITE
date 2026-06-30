import { getLeads } from './actions'
import LeadsClient from './LeadsClient'

export default async function LeadsPage() {
  const initialLeads = await getLeads()

  return (
    <div className="w-full">
      <LeadsClient initialLeads={initialLeads} />
    </div>
  )
}
