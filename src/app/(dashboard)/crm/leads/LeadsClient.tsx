'use client'

import { useState, useMemo, useEffect } from 'react'
import { Plus, Edit2, Trash2, X, Search, Globe, FilterX, Download } from 'lucide-react'


import { createClient } from '@/lib/supabase/client'
import { createLead, updateLead, deleteLead, deleteMultipleLeads, updateLeadStatus } from './actions'
import { useRouter } from 'next/navigation'

const LinkedinIcon = (props: any) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/>
  </svg>
)

const FacebookIcon = (props: any) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
  </svg>
)

const InstagramIcon = (props: any) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
  </svg>
)

const YoutubeIcon = (props: any) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.42a2.78 2.78 0 0 0-1.94 2C1 8.11 1 12 1 12s0 3.89.46 5.58a1.9 1.9 0 0 0 1.32 1.35c1.7.47 8.22.47 8.22.47s6.52 0 8.22-.47a1.9 1.9 0 0 0 1.32-1.35c.46-1.69.46-5.58.46-5.58s0-3.89-.46-5.58z"/><polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02"/>
  </svg>
)

export default function LeadsClient({ initialLeads, userRole = 'Admin' }: { initialLeads: any[], userRole?: string }) {
  const router = useRouter()
  const [leads, setLeads] = useState(initialLeads)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingLead, setEditingLead] = useState<any | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedSources, setSelectedSources] = useState<string[]>([])
  
  // Bulk Selection State
  const [selectedLeadIds, setSelectedLeadIds] = useState<string[]>([])

  useEffect(() => {
    const supabase = createClient()
    
    // Subscribe to all changes in the leads table
    const channel = supabase.channel('leads_changes')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'leads' }, (payload) => {
        setLeads((currentLeads) => {
          // Prevent duplicates if local state was updated optimistically
          if (currentLeads.some(l => l.id === payload.new.id)) return currentLeads
          return [payload.new, ...currentLeads]
        })
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'leads' }, (payload) => {
        setLeads((currentLeads) => currentLeads.map(lead => lead.id === payload.new.id ? payload.new : lead))
      })
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'leads' }, (payload) => {
        setLeads((currentLeads) => currentLeads.filter(lead => lead.id !== payload.old.id))
        setSelectedLeadIds((currentIds) => currentIds.filter(id => id !== payload.old.id))
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const toggleSourceFilter = (source: string) => {
    setSelectedSources(prev => 
      prev.includes(source) 
        ? prev.filter(s => s !== source)
        : [...prev, source]
    )
  }

  const openAddModal = () => {
    setEditingLead(null)
    setError('')
    setIsModalOpen(true)
  }

  const openEditModal = (lead: any) => {
    setEditingLead(lead)
    setError('')
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingLead(null)
  }

  const toggleSelectAll = () => {
    if (selectedLeadIds.length === filteredLeads.length && filteredLeads.length > 0) {
      setSelectedLeadIds([])
    } else {
      setSelectedLeadIds(filteredLeads.map((l: any) => l.id))
    }
  }

  const toggleSelect = (id: string) => {
    if (selectedLeadIds.includes(id)) {
      setSelectedLeadIds(selectedLeadIds.filter(leadId => leadId !== id))
    } else {
      setSelectedLeadIds([...selectedLeadIds, id])
    }
  }

  const handleBulkDelete = async () => {
    if (selectedLeadIds.length === 0) return
    if (!confirm(`Are you sure you want to delete ${selectedLeadIds.length} leads?`)) return
    
    try {
      const result = await deleteMultipleLeads(selectedLeadIds)
      if (result.error) {
        alert(result.error)
      } else {
        setLeads(leads.filter(l => !selectedLeadIds.includes(l.id)))
        setSelectedLeadIds([])
        router.refresh()
      }
    } catch (err) {
      alert('Failed to delete leads.')
    }
  }

  const exportToCSV = () => {
    const leadsToExport = filteredLeads;
    if (!leadsToExport || leadsToExport.length === 0) {
      alert('No leads to export');
      return;
    }

    const headers = ['Date', 'Name', 'Email', 'Phone', 'Source', 'Project', 'Enquiry Type', 'Property Interest', 'Location', 'Status', 'Message'];
    const csvRows = [headers.join(',')];

    for (const lead of leadsToExport) {
      const values = [
        `"${new Date(lead.created_at).toLocaleDateString()}"`,
        `"${(lead.name || '').replace(/"/g, '""')}"`,
        `"${(lead.email || '').replace(/"/g, '""')}"`,
        `"${(lead.phone || '').replace(/"/g, '""')}"`,
        `"${(lead.source_page || 'contact').replace(/"/g, '""')}"`,
        `"${(lead.project || '').replace(/"/g, '""')}"`,
        `"${(lead.enquiry_type || '').replace(/"/g, '""')}"`,
        `"${(lead.property_interest || '').replace(/"/g, '""')}"`,
        `"${(lead.location || '').replace(/"/g, '""')}"`,
        `"${(lead.status || 'new').replace(/"/g, '""')}"`,
        `"${(lead.message || '').replace(/"/g, '""').replace(/\n/g, ' ')}"`
      ];
      csvRows.push(values.join(','));
    }

    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `leads_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    const formData = new FormData(e.currentTarget)
    
    try {
      let result;
      if (editingLead) {
        result = await updateLead(editingLead.id, formData)
      } else {
        result = await createLead(formData)
      }

      if (result.error) {
        setError(result.error)
      } else {
        router.refresh()
        if (result.data) {
          if (editingLead) {
            setLeads(leads.map(l => l.id === editingLead.id ? result.data[0] : l))
          } else {
            setLeads([result.data[0], ...leads])
          }
        }
        closeModal()
      }
    } catch (err) {
      setError('An unexpected error occurred.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this lead?')) return
    
    try {
      const result = await deleteLead(id)
      if (result.error) {
        alert(result.error)
      } else {
        setLeads(leads.filter(l => l.id !== id))
        // also remove from selected if present
        setSelectedLeadIds(selectedLeadIds.filter(leadId => leadId !== id))
        router.refresh()
      }
    } catch (err) {
      alert('Failed to delete lead.')
    }
  }

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      const result = await updateLeadStatus(id, newStatus)
      if (result.error) {
        alert(result.error)
      } else {
        setLeads(leads.map(l => l.id === id ? { ...l, status: newStatus } : l))
        router.refresh()
      }
    } catch (err) {
      alert('Failed to update status.')
    }
  }

  const filteredLeads = useMemo(() => {
    let result = leads;
    
    if (selectedSources.length > 0) {
      result = result.filter(lead => {
        const source = lead.source_page?.toLowerCase() || '';
        return selectedSources.some(s => source.includes(s));
      });
    }
    
    if (!searchQuery.trim()) return result;
    const lowerQuery = searchQuery.toLowerCase();
    return result.filter(lead => 
      (lead.name && lead.name.toLowerCase().includes(lowerQuery)) ||
      (lead.email && lead.email.toLowerCase().includes(lowerQuery)) ||
      (lead.phone && lead.phone.toLowerCase().includes(lowerQuery)) ||
      (lead.project && lead.project.toLowerCase().includes(lowerQuery))
    );
  }, [leads, searchQuery, selectedSources]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[#0f1d33]">Leads</h1>
          <p className="mt-2 text-sm text-[#5a6a82]">
            Manage and view your leads from all sources.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="h-4 w-4 text-[#5a6a82]" />
            </div>
            <input
              type="text"
              placeholder="Search leads..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full rounded-lg border border-[#e8ecf2] bg-white py-2 pl-10 pr-3 text-sm text-[#0f1d33] placeholder-[#5a6a82] outline-none focus:border-[#1e3a5f] focus:ring-1 focus:ring-[#1e3a5f] transition-shadow"
            />
          </div>
          {selectedLeadIds.length > 0 && userRole !== 'Telecaller' && (
            <button
              onClick={handleBulkDelete}
              className="inline-flex items-center w-full sm:w-auto justify-center rounded-lg bg-red-50 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-100 transition-colors"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Selected ({selectedLeadIds.length})
            </button>
          )}

          <button
            onClick={openAddModal}
            className="inline-flex items-center w-full sm:w-auto justify-center rounded-lg bg-gradient-to-r from-[#c4a55a] to-[#b3954c] px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-[#c4a55a]/20 hover:opacity-90 transition-opacity"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Lead
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 bg-white p-4 rounded-xl border border-[#e8ecf2] shadow-sm">
        <span className="text-sm font-medium text-[#5a6a82] mr-2">Filter by Source:</span>
        
        <button
          onClick={() => toggleSourceFilter('instagram')}
          className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-colors border ${
            selectedSources.includes('instagram') ? 'bg-pink-50 border-pink-200 text-pink-600' : 'bg-[#f3f5f8] border-transparent text-[#5a6a82] hover:bg-[#e8ecf2]'
          }`}
        >
          <InstagramIcon className="w-4 h-4" /> Instagram
        </button>
        
        <button
          onClick={() => toggleSourceFilter('facebook')}
          className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-colors border ${
            selectedSources.includes('facebook') ? 'bg-blue-50 border-blue-200 text-blue-600' : 'bg-[#f3f5f8] border-transparent text-[#5a6a82] hover:bg-[#e8ecf2]'
          }`}
        >
          <FacebookIcon className="w-4 h-4" /> Facebook
        </button>
        
        <button
          onClick={() => toggleSourceFilter('website')}
          className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-colors border ${
            selectedSources.includes('website') ? 'bg-emerald-50 border-emerald-200 text-emerald-600' : 'bg-[#f3f5f8] border-transparent text-[#5a6a82] hover:bg-[#e8ecf2]'
          }`}
        >
          <Globe className="w-4 h-4" /> Website
        </button>
        
        <button
          onClick={() => toggleSourceFilter('youtube')}
          className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-colors border ${
            selectedSources.includes('youtube') ? 'bg-red-50 border-red-200 text-red-600' : 'bg-[#f3f5f8] border-transparent text-[#5a6a82] hover:bg-[#e8ecf2]'
          }`}
        >
          <YoutubeIcon className="w-4 h-4" /> YouTube
        </button>

        <button
          onClick={() => toggleSourceFilter('linkedin')}
          className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-colors border ${
            selectedSources.includes('linkedin') ? 'bg-indigo-50 border-indigo-200 text-indigo-600' : 'bg-[#f3f5f8] border-transparent text-[#5a6a82] hover:bg-[#e8ecf2]'
          }`}
        >
          <LinkedinIcon className="w-4 h-4" /> LinkedIn
        </button>

        <div className="flex items-center gap-2 ml-auto">
          {selectedSources.length > 0 && (
            <button
              onClick={() => setSelectedSources([])}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium text-[#5a6a82] hover:text-[#0f1d33] transition-colors"
            >
              <FilterX className="w-4 h-4" /> Clear Filter
            </button>
          )}
          <button
            onClick={exportToCSV}
            className="inline-flex items-center gap-1.5 justify-center rounded-full bg-[#0f1d33] px-4 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-[#1e3a5f] transition-colors"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </button>
        </div>
      </div>

      <div className="rounded-xl border border-[#e8ecf2] bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-[#f7f8fa] text-[#5a6a82]">
              <tr>
                <th className="px-6 py-4 font-medium w-10">
                  <input
                    type="checkbox"
                    checked={filteredLeads.length > 0 && filteredLeads.every(l => selectedLeadIds.includes(l.id))}
                    onChange={toggleSelectAll}
                    className="rounded border-[#e8ecf2] text-[#1e3a5f] focus:ring-[#1e3a5f]"
                  />
                </th>
                <th className="px-6 py-4 font-medium">Date</th>
                <th className="px-6 py-4 font-medium">Name</th>
                <th className="px-6 py-4 font-medium">Contact</th>
                <th className="px-6 py-4 font-medium">Source</th>
                <th className="px-6 py-4 font-medium">Status</th>
                {userRole !== 'Telecaller' && (
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e8ecf2]">
              {filteredLeads && filteredLeads.length > 0 ? (
                filteredLeads.map((lead: any) => (
                  <tr key={lead.id} className="hover:bg-[#f3f5f8] transition-colors">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedLeadIds.includes(lead.id)}
                        onChange={() => toggleSelect(lead.id)}
                        className="rounded border-[#e8ecf2] text-[#1e3a5f] focus:ring-[#1e3a5f]"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-[#0f1d33]">
                        {new Date(lead.created_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </div>
                      <div className="text-xs text-[#5a6a82] mt-0.5">
                        {new Date(lead.created_at).toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-[#0f1d33]">{lead.name}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-[#0f1d33]">{lead.phone || '-'}</div>
                      <div className="text-xs text-[#5a6a82]">{lead.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col items-start gap-1">
                        <span className="inline-flex items-center rounded-full bg-[#f3f5f8] px-2.5 py-0.5 text-xs font-medium text-[#1e3a5f]">
                          {lead.source_page || 'contact'}
                        </span>
                        {lead.enquiry_type && (
                          <span className="text-xs text-[#5a6a82]">
                            {lead.enquiry_type}
                          </span>
                        )}
                        {lead.downloaded_item && (
                          <span className="text-xs font-semibold text-[#c4a55a]">
                            Doc: {lead.downloaded_item}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={lead.status || 'new'}
                        onChange={(e) => handleStatusChange(lead.id, e.target.value)}
                        className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium capitalize appearance-none cursor-pointer border border-transparent focus:border-[#e8ecf2] focus:ring-0 hover:opacity-80 transition-opacity
                          ${lead.status === 'new' ? 'bg-emerald-50 text-emerald-600' 
                          : lead.status === 'closed' || lead.status === 'rejected' ? 'bg-red-50 text-red-600'
                          : lead.status === 'contacted' ? 'bg-blue-50 text-blue-600'
                          : lead.status === 'uncontacted' ? 'bg-orange-50 text-orange-600'
                          : lead.status === 'qualified' ? 'bg-purple-50 text-purple-600'
                          : 'bg-[#f3f5f8] text-[#1e3a5f]'}`}
                      >
                        <option value="new">New</option>
                        <option value="contacted">Contacted</option>
                        <option value="uncontacted">Uncontacted</option>
                        <option value="qualified">Qualified</option>
                        <option value="rejected">Rejected</option>
                        <option value="closed">Closed</option>
                      </select>
                    </td>
                    {userRole !== 'Telecaller' && (
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end space-x-3">
                          <button
                            onClick={() => openEditModal(lead)}
                            className="text-[#1e3a5f] hover:text-[#0f1d33]"
                            title="Edit"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(lead.id)}
                            className="text-red-500 hover:text-red-700"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={userRole === 'Telecaller' ? 6 : 7} className="px-6 py-8 text-center text-[#5a6a82]">
                    No leads found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0f1d33]/50 p-4">
          <div className="w-full max-w-2xl rounded-xl bg-white p-6 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-[#0f1d33]">
                {editingLead ? 'Edit Lead' : 'Add Lead'}
              </h2>
              <button onClick={closeModal} className="text-[#5a6a82] hover:text-[#0f1d33]">
                <X className="h-5 w-5" />
              </button>
            </div>

            {error && (
              <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-600">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-[#0f1d33] mb-1">Name *</label>
                  <input
                    type="text"
                    name="name"
                    id="name"
                    required
                    defaultValue={editingLead?.name}
                    className="w-full rounded-lg border border-[#e8ecf2] bg-[#f3f5f8] px-3 py-2.5 text-sm text-[#0f1d33] outline-none focus:border-[#1e3a5f]"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-[#0f1d33] mb-1">Email *</label>
                  <input
                    type="email"
                    name="email"
                    id="email"
                    required
                    defaultValue={editingLead?.email}
                    className="w-full rounded-lg border border-[#e8ecf2] bg-[#f3f5f8] px-3 py-2.5 text-sm text-[#0f1d33] outline-none focus:border-[#1e3a5f]"
                  />
                </div>
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-[#0f1d33] mb-1">Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    id="phone"
                    defaultValue={editingLead?.phone}
                    className="w-full rounded-lg border border-[#e8ecf2] bg-[#f3f5f8] px-3 py-2.5 text-sm text-[#0f1d33] outline-none focus:border-[#1e3a5f]"
                  />
                </div>
                <div>
                  <label htmlFor="status" className="block text-sm font-medium text-[#0f1d33] mb-1">Status</label>
                  <select
                    name="status"
                    id="status"
                    defaultValue={editingLead?.status || 'new'}
                    className="w-full rounded-lg border border-[#e8ecf2] bg-[#f3f5f8] px-3 py-2.5 text-sm text-[#0f1d33] outline-none focus:border-[#1e3a5f]"
                  >
                    <option value="new">New</option>
                    <option value="contacted">Contacted</option>
                    <option value="uncontacted">Uncontacted</option>
                    <option value="qualified">Qualified</option>
                    <option value="rejected">Rejected</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="source_page" className="block text-sm font-medium text-[#0f1d33] mb-1">Source</label>
                  <input
                    type="text"
                    name="source_page"
                    id="source_page"
                    defaultValue={editingLead?.source_page || 'contact'}
                    className="w-full rounded-lg border border-[#e8ecf2] bg-[#f3f5f8] px-3 py-2.5 text-sm text-[#0f1d33] outline-none focus:border-[#1e3a5f]"
                  />
                </div>
                <div>
                  <label htmlFor="location" className="block text-sm font-medium text-[#0f1d33] mb-1">Location</label>
                  <input
                    type="text"
                    name="location"
                    id="location"
                    defaultValue={editingLead?.location}
                    className="w-full rounded-lg border border-[#e8ecf2] bg-[#f3f5f8] px-3 py-2.5 text-sm text-[#0f1d33] outline-none focus:border-[#1e3a5f]"
                  />
                </div>
                <div>
                  <label htmlFor="project" className="block text-sm font-medium text-[#0f1d33] mb-1">Project</label>
                  <input
                    type="text"
                    name="project"
                    id="project"
                    defaultValue={editingLead?.project}
                    className="w-full rounded-lg border border-[#e8ecf2] bg-[#f3f5f8] px-3 py-2.5 text-sm text-[#0f1d33] outline-none focus:border-[#1e3a5f]"
                  />
                </div>
                <div>
                  <label htmlFor="enquiry_type" className="block text-sm font-medium text-[#0f1d33] mb-1">Enquiry Type</label>
                  <input
                    type="text"
                    name="enquiry_type"
                    id="enquiry_type"
                    defaultValue={editingLead?.enquiry_type}
                    className="w-full rounded-lg border border-[#e8ecf2] bg-[#f3f5f8] px-3 py-2.5 text-sm text-[#0f1d33] outline-none focus:border-[#1e3a5f]"
                  />
                </div>
                <div>
                  <label htmlFor="property_interest" className="block text-sm font-medium text-[#0f1d33] mb-1">Property Interest</label>
                  <input
                    type="text"
                    name="property_interest"
                    id="property_interest"
                    defaultValue={editingLead?.property_interest}
                    className="w-full rounded-lg border border-[#e8ecf2] bg-[#f3f5f8] px-3 py-2.5 text-sm text-[#0f1d33] outline-none focus:border-[#1e3a5f]"
                  />
                </div>
                <div>
                  <label htmlFor="downloaded_item" className="block text-sm font-medium text-[#0f1d33] mb-1">Downloaded Item</label>
                  <input
                    type="text"
                    name="downloaded_item"
                    id="downloaded_item"
                    defaultValue={editingLead?.downloaded_item}
                    className="w-full rounded-lg border border-[#e8ecf2] bg-[#f3f5f8] px-3 py-2.5 text-sm text-[#0f1d33] outline-none focus:border-[#1e3a5f]"
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-[#0f1d33] mb-1">Message *</label>
                <textarea
                  name="message"
                  id="message"
                  required
                  rows={3}
                  defaultValue={editingLead?.message}
                  className="w-full rounded-lg border border-[#e8ecf2] bg-[#f3f5f8] px-3 py-2.5 text-sm text-[#0f1d33] outline-none focus:border-[#1e3a5f]"
                />
              </div>

              <div className="mt-6 flex justify-end space-x-3 border-t border-[#e8ecf2] pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-lg px-4 py-2 text-sm font-medium text-[#5a6a82] hover:bg-[#f3f5f8]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-[#c4a55a] to-[#b3954c] px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-[#c4a55a]/20 hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {isLoading ? 'Saving...' : 'Save Lead'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
