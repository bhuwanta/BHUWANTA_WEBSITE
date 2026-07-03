'use client'

import { useState, useEffect, useCallback } from 'react'
import { Plus, Edit, Trash2, Eye, EyeOff, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

interface Job {
  id: string; title: string; department: string; location: string;
  employment_type: string; salary_min: number | null; salary_max: number | null;
  description: string; requirements: string[]; apply_url: string; is_active: boolean; posted_at: string;
}

const emptyJob: Omit<Job, 'id' | 'posted_at'> = {
  title: '', department: '', location: '', employment_type: 'full-time',
  salary_min: null, salary_max: null, description: '', requirements: [],
  apply_url: '', is_active: true,
}

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [editing, setEditing] = useState<Partial<Job> | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [reqInput, setReqInput] = useState('')
  const supabase = createClient()

  const fetchJobs = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase.from('job_listings').select('*').order('posted_at', { ascending: false })
    setJobs(data || [])
    setLoading(false)
  }, [supabase])

  useEffect(() => { fetchJobs() }, [fetchJobs])

  async function handleSave() {
    if (!editing?.title || !editing?.location || !editing?.description) {
      toast.error('Title, location, and description are required')
      return
    }
    setSaving(true)
    const payload = { ...editing }
    delete (payload as any).id
    delete (payload as any).posted_at

    if (editing.id) {
      await supabase.from('job_listings').update(payload).eq('id', editing.id)
      toast.success('Job updated')
    } else {
      await supabase.from('job_listings').insert(payload)
      toast.success('Job created')
    }
    setSaving(false)
    setEditing(null)
    fetchJobs()
  }

  async function toggleActive(job: Job) {
    await supabase.from('job_listings').update({ is_active: !job.is_active }).eq('id', job.id)
    toast.success(job.is_active ? 'Job deactivated' : 'Job activated')
    fetchJobs()
  }

  async function deleteJob(id: string) {
    if (!confirm('Delete this job listing?')) return
    await supabase.from('job_listings').delete().eq('id', id)
    toast.success('Job deleted')
    fetchJobs()
  }

  function addRequirement() {
    if (!reqInput.trim()) return
    setEditing(prev => prev ? { ...prev, requirements: [...(prev.requirements || []), reqInput.trim()] } : null)
    setReqInput('')
  }

  if (editing) {
    return (
      <div className="space-y-6 max-w-3xl">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-[#002935]">{editing.id ? 'Edit Job' : 'New Job Listing'}</h1>
          <button onClick={() => setEditing(null)} className="text-sm text-[#5a6a82] hover:text-[#002935]">Cancel</button>
        </div>
        <div className="bg-white border border-[#e8ecf2] shadow-sm rounded-xl p-6 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#002935] mb-1">Title *</label>
              <input value={editing.title || ''} onChange={e => setEditing({ ...editing, title: e.target.value })} className="w-full px-3 py-2.5 rounded-lg bg-[#f3f5f8] border border-[#e8ecf2] text-[#002935] text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#002935] mb-1">Department</label>
              <input value={editing.department || ''} onChange={e => setEditing({ ...editing, department: e.target.value })} className="w-full px-3 py-2.5 rounded-lg bg-[#f3f5f8] border border-[#e8ecf2] text-[#002935] text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#002935] mb-1">Location *</label>
              <input value={editing.location || ''} onChange={e => setEditing({ ...editing, location: e.target.value })} className="w-full px-3 py-2.5 rounded-lg bg-[#f3f5f8] border border-[#e8ecf2] text-[#002935] text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#002935] mb-1">Type</label>
              <select value={editing.employment_type || 'full-time'} onChange={e => setEditing({ ...editing, employment_type: e.target.value })} className="w-full px-3 py-2.5 rounded-lg bg-[#f3f5f8] border border-[#e8ecf2] text-[#002935] text-sm">
                <option value="full-time">Full Time</option><option value="part-time">Part Time</option><option value="contract">Contract</option><option value="internship">Internship</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#002935] mb-1">Min Salary (₹)</label>
              <input type="number" value={editing.salary_min || ''} onChange={e => setEditing({ ...editing, salary_min: Number(e.target.value) || null })} className="w-full px-3 py-2.5 rounded-lg bg-[#f3f5f8] border border-[#e8ecf2] text-[#002935] text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#002935] mb-1">Max Salary (₹)</label>
              <input type="number" value={editing.salary_max || ''} onChange={e => setEditing({ ...editing, salary_max: Number(e.target.value) || null })} className="w-full px-3 py-2.5 rounded-lg bg-[#f3f5f8] border border-[#e8ecf2] text-[#002935] text-sm" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-[#002935] mb-1">Description *</label>
            <textarea value={editing.description || ''} onChange={e => setEditing({ ...editing, description: e.target.value })} rows={5} className="w-full px-3 py-2.5 rounded-lg bg-[#f3f5f8] border border-[#e8ecf2] text-[#002935] text-sm resize-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#002935] mb-1">Requirements</label>
            <div className="flex gap-2 mb-2">
              <input value={reqInput} onChange={e => setReqInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && addRequirement()} placeholder="Add requirement..." className="flex-1 px-3 py-2 rounded-lg bg-[#f3f5f8] border border-[#e8ecf2] text-[#002935] text-sm" />
              <button onClick={addRequirement} className="px-3 py-2 rounded-lg bg-[#003d4f]/10 text-[#003d4f] text-sm font-medium">Add</button>
            </div>
            <div className="flex flex-wrap gap-2">
              {(editing.requirements || []).map((req, i) => (
                <span key={i} className="px-2 py-1 rounded-md bg-[#f3f5f8] border border-[#e8ecf2] text-xs text-[#002935] flex items-center gap-1">
                  {req}
                  <button onClick={() => setEditing({ ...editing, requirements: editing.requirements?.filter((_, idx) => idx !== i) })} className="text-red-600 ml-1">×</button>
                </span>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-[#002935] mb-1">Apply URL</label>
            <input value={editing.apply_url || ''} onChange={e => setEditing({ ...editing, apply_url: e.target.value })} className="w-full px-3 py-2.5 rounded-lg bg-[#f3f5f8] border border-[#e8ecf2] text-[#002935] text-sm" />
          </div>
          <button onClick={handleSave} disabled={saving} className="px-6 py-2.5 rounded-lg gradient-gold text-black text-sm font-semibold flex items-center gap-2">
            {saving && <Loader2 className="w-4 h-4 animate-spin" />} {editing.id ? 'Update Job' : 'Create Job'}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#002935] mb-1">Job Posts</h1>
          <p className="text-sm text-[#5a6a82]">Manage career listings shown on the /careers page.</p>
        </div>
        <button onClick={() => setEditing({ ...emptyJob })} className="px-4 py-2.5 rounded-lg gradient-gold text-black text-sm font-semibold flex items-center gap-2">
          <Plus className="w-4 h-4" /> New Job
        </button>
      </div>
      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 text-[#003d4f] animate-spin" /></div>
      ) : jobs.length === 0 ? (
        <div className="bg-white border border-[#e8ecf2] shadow-sm rounded-xl p-12 text-center">
          <p className="text-[#5a6a82]">No job listings yet. Create your first one.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {jobs.map(job => (
            <div key={job.id} className="bg-white border border-[#e8ecf2] shadow-sm rounded-xl p-5 flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-[#002935]">{job.title}</h3>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${job.is_active ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                    {job.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <p className="text-xs text-[#5a6a82]">{job.location} · {job.employment_type} · {job.department}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button onClick={() => toggleActive(job)} className="p-2 rounded-lg hover:bg-[#f3f5f8] text-[#5a6a82]" title={job.is_active ? 'Deactivate' : 'Activate'}>
                  {job.is_active ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
                <button onClick={() => setEditing(job)} className="p-2 rounded-lg hover:bg-[#f3f5f8] text-[#5a6a82]"><Edit className="w-4 h-4" /></button>
                <button onClick={() => deleteJob(job.id)} className="p-2 rounded-lg hover:bg-red-50 text-red-600"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
