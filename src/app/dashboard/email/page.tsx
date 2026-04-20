'use client'

import { useState, useEffect, useCallback } from 'react'
import { Plus, Send, Loader2, Save, Trash2, Mail } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

export default function EmailPage() {
  const [tab, setTab] = useState<'templates' | 'campaigns'>('templates')
  const [templates, setTemplates] = useState<any[]>([])
  const [editing, setEditing] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const supabase = createClient()

  const fetchData = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase.from('email_templates').select('*').order('created_at', { ascending: false })
    setTemplates(data || [])
    setLoading(false)
  }, [supabase])

  useEffect(() => { fetchData() }, [fetchData])

  async function saveTemplate() {
    if (!editing?.name || !editing?.subject || !editing?.body_html) {
      toast.error('All fields required'); return
    }
    setSaving(true)
    if (editing.id) {
      await supabase.from('email_templates').update({ name: editing.name, subject: editing.subject, body_html: editing.body_html, type: editing.type }).eq('id', editing.id)
    } else {
      await supabase.from('email_templates').insert({ name: editing.name, subject: editing.subject, body_html: editing.body_html, type: editing.type || 'general' })
    }
    toast.success('Template saved')
    setSaving(false)
    setEditing(null)
    fetchData()
  }

  async function deleteTemplate(id: string) {
    if (!confirm('Delete this template?')) return
    await supabase.from('email_templates').delete().eq('id', id)
    toast.success('Template deleted')
    fetchData()
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#002935] mb-1">Email Tools</h1>
        <p className="text-sm text-[#5a6a82]">Manage email templates and campaigns via Resend.</p>
      </div>

      <div className="flex gap-1 p-1 rounded-lg bg-[#f3f5f8] border border-[#e8ecf2] w-fit">
        {[{ k: 'templates', l: 'Templates' }, { k: 'campaigns', l: 'Campaigns' }].map(t => (
          <button key={t.k} onClick={() => setTab(t.k as any)} className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${tab === t.k ? 'bg-[#003d4f]/10 text-[#003d4f]' : 'text-[#5a6a82] hover:text-[#002935]'}`}>
            {t.l}
          </button>
        ))}
      </div>

      {tab === 'templates' && (
        editing ? (
          <div className="bg-white border border-[#e8ecf2] shadow-sm rounded-xl p-6 space-y-4 max-w-3xl">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-[#002935]">{editing.id ? 'Edit Template' : 'New Template'}</h2>
              <button onClick={() => setEditing(null)} className="text-sm text-[#5a6a82]">Cancel</button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#002935] mb-1">Template Name</label>
                <input value={editing.name || ''} onChange={e => setEditing({ ...editing, name: e.target.value })} className="w-full px-3 py-2.5 rounded-lg bg-[#f3f5f8] border border-[#e8ecf2] text-[#002935] text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#002935] mb-1">Type</label>
                <select value={editing.type || 'general'} onChange={e => setEditing({ ...editing, type: e.target.value })} className="w-full px-3 py-2.5 rounded-lg bg-[#f3f5f8] border border-[#e8ecf2] text-[#002935] text-sm">
                  <option value="lead_ack">Lead Acknowledgement</option>
                  <option value="agent_notify">Agent Notification</option>
                  <option value="newsletter">Newsletter</option>
                  <option value="drip">Drip Email</option>
                  <option value="general">General</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#002935] mb-1">Subject Line</label>
              <input value={editing.subject || ''} onChange={e => setEditing({ ...editing, subject: e.target.value })} className="w-full px-3 py-2.5 rounded-lg bg-[#f3f5f8] border border-[#e8ecf2] text-[#002935] text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#002935] mb-1">Body (HTML)</label>
              <textarea value={editing.body_html || ''} onChange={e => setEditing({ ...editing, body_html: e.target.value })} rows={12} className="w-full px-3 py-2.5 rounded-lg bg-[#f3f5f8] border border-[#e8ecf2] text-[#002935] text-sm font-mono resize-none" />
            </div>
            <button onClick={saveTemplate} disabled={saving} className="px-6 py-2.5 rounded-lg gradient-gold text-black text-sm font-semibold flex items-center gap-2">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save Template
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <button onClick={() => setEditing({ name: '', subject: '', body_html: '', type: 'general' })} className="px-4 py-2 rounded-lg gradient-gold text-black text-sm font-semibold flex items-center gap-2">
              <Plus className="w-4 h-4" /> New Template
            </button>
            {templates.length === 0 ? (
              <div className="bg-white border border-[#e8ecf2] shadow-sm rounded-xl p-12 text-center">
                <Mail className="w-12 h-12 text-[#5a6a82]/30 mx-auto mb-4" />
                <p className="text-[#5a6a82]">No templates yet. Create your first email template.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {templates.map(t => (
                  <div key={t.id} className="bg-white border border-[#e8ecf2] shadow-sm rounded-xl p-4 flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-[#002935]">{t.name}</h3>
                      <p className="text-xs text-[#5a6a82]">{t.subject} · {t.type}</p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => setEditing(t)} className="p-2 rounded-lg hover:bg-[#f3f5f8] text-[#5a6a82]"><Mail className="w-4 h-4" /></button>
                      <button onClick={() => deleteTemplate(t.id)} className="p-2 rounded-lg hover:bg-red-50 text-red-600"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )
      )}

      {tab === 'campaigns' && (
        <div className="bg-white border border-[#e8ecf2] shadow-sm rounded-xl p-8 text-center">
          <Send className="w-12 h-12 text-[#5a6a82]/30 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-[#002935] mb-2">Campaign Sender</h3>
          <p className="text-sm text-[#5a6a82] max-w-md mx-auto">
            Configure your Resend API key to send email campaigns. Campaign history and metrics will appear here.
          </p>
        </div>
      )}
    </div>
  )
}
