'use client'

import { useState, useEffect, useCallback } from 'react'
import { Download, Mail, Loader2, Search } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { formatDate } from '@/lib/utils'

const statusColors: Record<string, string> = {
  new: 'bg-blue-50 text-blue-600',
  contacted: 'bg-amber-50 text-amber-700',
  qualified: 'bg-emerald-50 text-emerald-600',
  closed: 'bg-muted text-[#5a6a82]',
}

export default function LeadsPage() {
  const [leads, setLeads] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('all')
  const [search, setSearch] = useState('')
  const supabase = createClient()

  const fetchLeads = useCallback(async () => {
    setLoading(true)
    let query = supabase.from('leads').select('*').order('created_at', { ascending: false })
    if (statusFilter !== 'all') query = query.eq('status', statusFilter)
    const { data } = await query
    setLeads(data || [])
    setLoading(false)
  }, [supabase, statusFilter])

  useEffect(() => { fetchLeads() }, [fetchLeads])

  async function updateStatus(id: string, status: string) {
    await supabase.from('leads').update({ status, updated_at: new Date().toISOString() }).eq('id', id)
    toast.success('Status updated')
    fetchLeads()
  }

  function exportCsv() {
    const headers = ['Name', 'Email', 'Phone', 'Message', 'Interest', 'Source', 'Status', 'Date']
    const rows = leads.map(l => [l.name, l.email, l.phone || '', l.message, l.property_interest || '', l.source_page, l.status, l.created_at])
    const csv = [headers.join(','), ...rows.map(r => r.map((c: string) => `"${c}"`).join(','))].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = `leads-${Date.now()}.csv`; a.click()
    toast.success('CSV exported')
  }

  const filtered = leads.filter(l => 
    !search || l.name.toLowerCase().includes(search.toLowerCase()) || l.email.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#002935] mb-1">Leads</h1>
          <p className="text-sm text-[#5a6a82]">{leads.length} total leads</p>
        </div>
        <button onClick={exportCsv} className="px-4 py-2 rounded-lg bg-[#f3f5f8] border border-[#e8ecf2] text-sm font-medium text-[#002935] flex items-center gap-2 hover:bg-[#ebeef3]">
          <Download className="w-4 h-4" /> Export CSV
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5a6a82]" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or email..." className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-[#f3f5f8] border border-[#e8ecf2] text-[#002935] text-sm" />
        </div>
        <div className="flex gap-1 p-1 rounded-lg bg-[#f3f5f8] border border-[#e8ecf2]">
          {['all', 'new', 'contacted', 'qualified', 'closed'].map(s => (
            <button key={s} onClick={() => setStatusFilter(s)} className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 ${statusFilter === s ? 'bg-[#003d4f]/10 text-[#003d4f]' : 'text-[#5a6a82] hover:text-[#002935]'}`}>
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Leads Table */}
      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 text-[#003d4f] animate-spin" /></div>
      ) : filtered.length === 0 ? (
        <div className="bg-white border border-[#e8ecf2] shadow-sm rounded-xl p-12 text-center">
          <p className="text-[#5a6a82]">No leads found.</p>
        </div>
      ) : (
        <div className="bg-white border border-[#e8ecf2] shadow-sm rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#e8ecf2]">
                  <th className="text-left p-4 text-xs font-semibold text-[#5a6a82] uppercase">Name</th>
                  <th className="text-left p-4 text-xs font-semibold text-[#5a6a82] uppercase">Email</th>
                  <th className="text-left p-4 text-xs font-semibold text-[#5a6a82] uppercase hidden md:table-cell">Phone</th>
                  <th className="text-left p-4 text-xs font-semibold text-[#5a6a82] uppercase hidden lg:table-cell">Interest</th>
                  <th className="text-left p-4 text-xs font-semibold text-[#5a6a82] uppercase">Status</th>
                  <th className="text-left p-4 text-xs font-semibold text-[#5a6a82] uppercase hidden md:table-cell">Date</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(lead => (
                  <tr key={lead.id} className="border-b border-[#e8ecf2] hover:bg-[#f7f8fa]">
                    <td className="p-4 font-medium text-[#002935]">{lead.name}</td>
                    <td className="p-4 text-[#5a6a82]">{lead.email}</td>
                    <td className="p-4 text-[#5a6a82] hidden md:table-cell">{lead.phone || '—'}</td>
                    <td className="p-4 text-[#5a6a82] hidden lg:table-cell">{lead.property_interest || '—'}</td>
                    <td className="p-4">
                      <select value={lead.status} onChange={e => updateStatus(lead.id, e.target.value)} className={`px-2 py-1 rounded-full text-xs font-medium border-0 ${statusColors[lead.status] || ''}`}>
                        <option value="new">New</option>
                        <option value="contacted">Contacted</option>
                        <option value="qualified">Qualified</option>
                        <option value="closed">Closed</option>
                      </select>
                    </td>
                    <td className="p-4 text-[#5a6a82] text-xs hidden md:table-cell">{formatDate(lead.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
