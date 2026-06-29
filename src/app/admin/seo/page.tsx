'use client'

import { useState, useEffect, useCallback } from 'react'
import { Save, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

const pages = ['home', 'about', 'gallery', 'projects', 'blog', 'careers', 'contact']

export default function SeoPage() {
  const [tab, setTab] = useState<'global' | 'per-page'>('global')
  const [global, setGlobal] = useState<any>({})
  const [selectedPage, setSelectedPage] = useState('home')
  const [pageSettings, setPageSettings] = useState<any>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const supabase = createClient()

  const fetchData = useCallback(async () => {
    setLoading(true)
    const { data: g } = await supabase.from('seo_global').select('*').single()
    if (g) setGlobal(g)
    const { data: p } = await supabase.from('seo_settings').select('*').eq('page_slug', selectedPage).single()
    if (p) setPageSettings(p)
    setLoading(false)
  }, [supabase, selectedPage])

  useEffect(() => { fetchData() }, [fetchData])

  async function saveGlobal() {
    setSaving(true)
    const { id, ...payload } = global
    await supabase.from('seo_global').update({ ...payload, updated_at: new Date().toISOString() }).eq('id', id)
    toast.success('Global SEO settings saved')
    setSaving(false)
  }

  async function savePageSettings() {
    setSaving(true)
    const { id, ...payload } = pageSettings
    await supabase.from('seo_settings').update({ ...payload, updated_at: new Date().toISOString() }).eq('id', id)
    toast.success(`SEO for "${selectedPage}" saved`)
    setSaving(false)
  }

  const Field = ({ label, value, onChange, type = 'text', rows }: any) => (
    <div>
      <label className="block text-sm font-medium text-[#002935] mb-1">{label}</label>
      {rows ? (
        <textarea value={value || ''} onChange={e => onChange(e.target.value)} rows={rows} className="w-full px-3 py-2.5 rounded-lg bg-[#f3f5f8] border border-[#e8ecf2] text-[#002935] text-sm resize-none" />
      ) : type === 'checkbox' ? (
        <input type="checkbox" checked={!!value} onChange={e => onChange(e.target.checked)} className="rounded" />
      ) : (
        <input type={type} value={value || ''} onChange={e => onChange(e.target.value)} className="w-full px-3 py-2.5 rounded-lg bg-[#f3f5f8] border border-[#e8ecf2] text-[#002935] text-sm" />
      )}
    </div>
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#002935] mb-1">SEO Tools</h1>
        <p className="text-sm text-[#5a6a82]">Manage global and per-page SEO settings.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-lg bg-[#f3f5f8] border border-[#e8ecf2] w-fit">
        {['global', 'per-page'].map(t => (
          <button key={t} onClick={() => setTab(t as any)} className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${tab === t ? 'bg-[#003d4f]/10 text-[#003d4f]' : 'text-[#5a6a82] hover:text-[#002935]'}`}>
            {t === 'global' ? 'Global Defaults' : 'Per-Page Overrides'}
          </button>
        ))}
      </div>

      {tab === 'global' ? (
        <div className="bg-white border border-[#e8ecf2] shadow-sm rounded-xl p-6 space-y-5 max-w-3xl">
          <Field label="Site Name" value={global.site_name} onChange={(v: string) => setGlobal({ ...global, site_name: v })} />
          <Field label="Title Template (use {page_title})" value={global.title_template} onChange={(v: string) => setGlobal({ ...global, title_template: v })} />
          <Field label="Default Meta Description" value={global.default_description} onChange={(v: string) => setGlobal({ ...global, default_description: v })} rows={3} />
          <Field label="Default OG Image URL" value={global.default_og_image} onChange={(v: string) => setGlobal({ ...global, default_og_image: v })} />
          <Field label="Twitter Card Type" value={global.twitter_card_type} onChange={(v: string) => setGlobal({ ...global, twitter_card_type: v })} />
          <Field label="Google Search Console Verification" value={global.google_verification} onChange={(v: string) => setGlobal({ ...global, google_verification: v })} />
          <Field label="Bing Webmaster Verification" value={global.bing_verification} onChange={(v: string) => setGlobal({ ...global, bing_verification: v })} />
          <button onClick={saveGlobal} disabled={saving} className="px-6 py-2.5 rounded-lg gradient-gold text-black text-sm font-semibold flex items-center gap-2">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save Global Settings
          </button>
        </div>
      ) : (
        <div className="space-y-4 max-w-3xl">
          <div className="flex gap-2 flex-wrap">
            {pages.map(p => (
              <button key={p} onClick={() => setSelectedPage(p)} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${selectedPage === p ? 'bg-[#003d4f]/10 text-[#003d4f] border border-[#003d4f]/20' : 'bg-[#f3f5f8] text-[#5a6a82] border border-[#e8ecf2] hover:text-[#002935]'}`}>
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </button>
            ))}
          </div>
          <div className="bg-white border border-[#e8ecf2] shadow-sm rounded-xl p-6 space-y-5">
            <Field label="Meta Title" value={pageSettings.meta_title} onChange={(v: string) => setPageSettings({ ...pageSettings, meta_title: v })} />
            <Field label="Meta Description" value={pageSettings.meta_description} onChange={(v: string) => setPageSettings({ ...pageSettings, meta_description: v })} rows={3} />
            <Field label="OG Image URL" value={pageSettings.og_image} onChange={(v: string) => setPageSettings({ ...pageSettings, og_image: v })} />
            <Field label="Canonical URL" value={pageSettings.canonical_url} onChange={(v: string) => setPageSettings({ ...pageSettings, canonical_url: v })} />
            <Field label="Focus Keyword" value={pageSettings.focus_keyword} onChange={(v: string) => setPageSettings({ ...pageSettings, focus_keyword: v })} />
            <Field label="Secondary Keywords (comma-separated)" value={pageSettings.secondary_keywords} onChange={(v: string) => setPageSettings({ ...pageSettings, secondary_keywords: v })} />
            <div className="flex items-center gap-3">
              <input type="checkbox" checked={!!pageSettings.noindex} onChange={e => setPageSettings({ ...pageSettings, noindex: e.target.checked })} className="rounded" />
              <label className="text-sm font-medium text-[#002935]">Noindex (hide from search engines)</label>
            </div>
            <button onClick={savePageSettings} disabled={saving} className="px-6 py-2.5 rounded-lg gradient-gold text-black text-sm font-semibold flex items-center gap-2">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save {selectedPage} Settings
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
