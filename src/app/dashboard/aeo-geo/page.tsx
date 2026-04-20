'use client'

import { useState, useEffect, useCallback } from 'react'
import { Plus, Save, Trash2, Loader2, MessageSquare, MapPin } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

const pages = ['home', 'about', 'gallery', 'projects', 'blog', 'careers', 'contact']

export default function AeoGeoPage() {
  const [tab, setTab] = useState<'faq' | 'business' | 'social'>('faq')
  const [faqs, setFaqs] = useState<any[]>([])
  const [business, setBusiness] = useState<any>({})
  const [selectedPage, setSelectedPage] = useState('home')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const supabase = createClient()

  const fetchData = useCallback(async () => {
    setLoading(true)
    const [faqRes, bizRes] = await Promise.all([
      supabase.from('faq_entries').select('*').eq('page_slug', selectedPage).order('sort_order'),
      supabase.from('local_business').select('*').single(),
    ])
    setFaqs(faqRes.data || [])
    if (bizRes.data) setBusiness(bizRes.data)
    setLoading(false)
  }, [supabase, selectedPage])

  useEffect(() => { fetchData() }, [fetchData])

  async function addFaq() {
    await supabase.from('faq_entries').insert({ page_slug: selectedPage, question: '', answer: '', sort_order: faqs.length })
    fetchData()
  }

  async function updateFaq(id: string, field: string, value: string) {
    setFaqs(prev => prev.map(f => f.id === id ? { ...f, [field]: value } : f))
  }

  async function saveFaqs() {
    setSaving(true)
    for (const faq of faqs) {
      if (faq.question && faq.answer) {
        await supabase.from('faq_entries').update({ question: faq.question, answer: faq.answer }).eq('id', faq.id)
      }
    }
    toast.success('FAQs saved')
    setSaving(false)
  }

  async function deleteFaq(id: string) {
    await supabase.from('faq_entries').delete().eq('id', id)
    toast.success('FAQ deleted')
    fetchData()
  }

  async function saveBusiness() {
    setSaving(true)
    const { id, ...payload } = business
    await supabase.from('local_business').update({ ...payload, updated_at: new Date().toISOString() }).eq('id', id)
    toast.success('Business info saved')
    setSaving(false)
  }

  const BizField = ({ label, field, type = 'text' }: any) => (
    <div>
      <label className="block text-sm font-medium text-[#002935] mb-1">{label}</label>
      <input type={type} value={business[field] || ''} onChange={e => setBusiness({ ...business, [field]: type === 'number' ? Number(e.target.value) : e.target.value })} className="w-full px-3 py-2.5 rounded-lg bg-[#f3f5f8] border border-[#e8ecf2] text-[#002935] text-sm" />
    </div>
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#002935] mb-1">AEO / GEO Settings</h1>
        <p className="text-sm text-[#5a6a82]">Optimize for AI engines and local search.</p>
      </div>

      <div className="flex gap-1 p-1 rounded-lg bg-[#f3f5f8] border border-[#e8ecf2] w-fit">
        {[{ k: 'faq', l: 'FAQ Manager', i: MessageSquare }, { k: 'business', l: 'Local Business', i: MapPin }].map(t => (
          <button key={t.k} onClick={() => setTab(t.k as any)} className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 flex items-center gap-2 ${tab === t.k ? 'bg-[#003d4f]/10 text-[#003d4f]' : 'text-[#5a6a82] hover:text-[#002935]'}`}>
            <t.i className="w-4 h-4" /> {t.l}
          </button>
        ))}
      </div>

      {tab === 'faq' && (
        <div className="space-y-4 max-w-3xl">
          <div className="flex gap-2 flex-wrap">
            {pages.map(p => (
              <button key={p} onClick={() => setSelectedPage(p)} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${selectedPage === p ? 'bg-[#003d4f]/10 text-[#003d4f] border border-[#003d4f]/20' : 'bg-[#f3f5f8] text-[#5a6a82] border border-[#e8ecf2]'}`}>
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </button>
            ))}
          </div>
          <div className="space-y-3">
            {faqs.map(faq => (
              <div key={faq.id} className="bg-white border border-[#e8ecf2] shadow-sm rounded-xl p-4 space-y-3">
                <input value={faq.question} onChange={e => updateFaq(faq.id, 'question', e.target.value)} placeholder="Question" className="w-full px-3 py-2 rounded-lg bg-[#f3f5f8] border border-[#e8ecf2] text-[#002935] text-sm font-medium" />
                <textarea value={faq.answer} onChange={e => updateFaq(faq.id, 'answer', e.target.value)} placeholder="Answer" rows={3} className="w-full px-3 py-2 rounded-lg bg-[#f3f5f8] border border-[#e8ecf2] text-[#002935] text-sm resize-none" />
                <button onClick={() => deleteFaq(faq.id)} className="text-xs text-red-600 flex items-center gap-1"><Trash2 className="w-3 h-3" /> Remove</button>
              </div>
            ))}
          </div>
          <div className="flex gap-3">
            <button onClick={addFaq} className="px-4 py-2 rounded-lg bg-[#f3f5f8] border border-[#e8ecf2] text-sm font-medium text-[#002935] flex items-center gap-2"><Plus className="w-4 h-4" /> Add FAQ</button>
            <button onClick={saveFaqs} disabled={saving} className="px-4 py-2 rounded-lg gradient-gold text-black text-sm font-semibold flex items-center gap-2">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save All
            </button>
          </div>
        </div>
      )}

      {tab === 'business' && (
        <div className="bg-white border border-[#e8ecf2] shadow-sm rounded-xl p-6 space-y-5 max-w-3xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <BizField label="Business Name" field="business_name" />
            <BizField label="Business Type" field="business_type" />
            <BizField label="Phone" field="phone" />
            <BizField label="Email" field="email" />
            <BizField label="Website" field="website" />
            <BizField label="Street Address" field="street_address" />
            <BizField label="City" field="city" />
            <BizField label="State" field="state" />
            <BizField label="Postal Code" field="postal_code" />
            <BizField label="Country" field="country" />
            <BizField label="Latitude" field="latitude" type="number" />
            <BizField label="Longitude" field="longitude" type="number" />
            <BizField label="Price Range" field="price_range" />
            <BizField label="Logo URL" field="logo_url" />
            <BizField label="Founding Year" field="founding_year" type="number" />
          </div>
          <button onClick={saveBusiness} disabled={saving} className="px-6 py-2.5 rounded-lg gradient-gold text-black text-sm font-semibold flex items-center gap-2">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save Business Info
          </button>
        </div>
      )}
    </div>
  )
}
