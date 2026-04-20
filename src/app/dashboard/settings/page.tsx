'use client'

import { useState, useEffect, useCallback } from 'react'
import { Save, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

export default function SettingsPage() {
  const [config, setConfig] = useState<any>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const supabase = createClient()

  const fetchConfig = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase.from('site_config').select('*').single()
    if (data) setConfig(data)
    setLoading(false)
  }, [supabase])

  useEffect(() => { fetchConfig() }, [fetchConfig])

  async function saveConfig() {
    setSaving(true)
    const { id, ...payload } = config
    await supabase.from('site_config').update({ ...payload, updated_at: new Date().toISOString() }).eq('id', id)
    toast.success('Settings saved')
    setSaving(false)
  }

  const Field = ({ label, field, desc }: { label: string; field: string; desc?: string }) => (
    <div>
      <label className="block text-sm font-medium text-[#002935] mb-1">{label}</label>
      {desc && <p className="text-xs text-[#5a6a82] mb-2">{desc}</p>}
      <input value={config[field] || ''} onChange={e => setConfig({ ...config, [field]: e.target.value })} className="w-full px-3 py-2.5 rounded-lg bg-[#f3f5f8] border border-[#e8ecf2] text-[#002935] text-sm font-mono" />
    </div>
  )

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-[#002935] mb-1">Settings</h1>
        <p className="text-sm text-[#5a6a82]">Site-wide configuration and third-party integrations.</p>
      </div>

      <div className="bg-white border border-[#e8ecf2] shadow-sm rounded-xl p-6 space-y-6">
        <h2 className="text-lg font-semibold text-[#002935]">Analytics & Tracking</h2>
        <Field label="Google Analytics ID" field="ga_id" desc="e.g., G-XXXXXXXXXX" />
        <Field label="Facebook Pixel ID" field="fb_pixel_id" />
        <Field label="Google Tag Manager ID" field="gtm_id" desc="e.g., GTM-XXXXXXX" />
      </div>

      <div className="bg-white border border-[#e8ecf2] shadow-sm rounded-xl p-6 space-y-6">
        <h2 className="text-lg font-semibold text-[#002935]">Email & Monitoring</h2>
        <Field label="Resend Sender Email" field="resend_sender" desc="The email address used to send notifications" />
        <Field label="Sentry DSN" field="sentry_dsn" desc="For error monitoring" />
      </div>

      <div className="bg-white border border-[#e8ecf2] shadow-sm rounded-xl p-6 space-y-4">
        <h2 className="text-lg font-semibold text-[#002935]">Sitemap & Robots</h2>
        <div>
          <p className="text-sm text-[#5a6a82] mb-2">Sitemap URL</p>
          <code className="block px-3 py-2 rounded-lg bg-[#f3f5f8] border border-[#e8ecf2] text-xs text-[#5a6a82] font-mono">
            {process.env.NEXT_PUBLIC_SITE_URL || 'https://bhuwanta.com'}/sitemap.xml
          </code>
        </div>
        <div>
          <p className="text-sm text-[#5a6a82] mb-2">Robots.txt</p>
          <code className="block px-3 py-2 rounded-lg bg-[#f3f5f8] border border-[#e8ecf2] text-xs text-[#5a6a82] font-mono whitespace-pre">
{`User-agent: *
Allow: /
Disallow: /dashboard
Disallow: /studio
Sitemap: ${process.env.NEXT_PUBLIC_SITE_URL || 'https://bhuwanta.com'}/sitemap.xml`}
          </code>
        </div>
      </div>

      <button onClick={saveConfig} disabled={saving} className="px-6 py-2.5 rounded-lg gradient-gold text-black text-sm font-semibold flex items-center gap-2">
        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save Settings
      </button>
    </div>
  )
}
