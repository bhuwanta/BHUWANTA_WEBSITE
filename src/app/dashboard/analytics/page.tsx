import { BarChart3, Eye, MousePointerClick, Users } from 'lucide-react'

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#002935] mb-1">Analytics</h1>
        <p className="text-sm text-[#5a6a82]">Overview of site performance and engagement metrics.</p>
      </div>

      {/* Placeholder stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Page Views (30d)', value: '—', icon: Eye, color: 'text-blue-600' },
          { label: 'Unique Visitors', value: '—', icon: Users, color: 'text-emerald-600' },
          { label: 'Form Conversions', value: '—', icon: MousePointerClick, color: 'text-amber-700' },
          { label: 'Avg. Session', value: '—', icon: BarChart3, color: 'text-purple-600' },
        ].map(s => (
          <div key={s.label} className="bg-white border border-[#e8ecf2] shadow-sm rounded-xl p-5">
            <s.icon className={`w-5 h-5 ${s.color} mb-3`} />
            <p className="text-3xl font-bold text-[#002935]">{s.value}</p>
            <p className="text-xs text-[#5a6a82] mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Integration notice */}
      <div className="bg-white border border-[#e8ecf2] shadow-sm rounded-xl p-8 text-center">
        <BarChart3 className="w-12 h-12 text-[#5a6a82]/30 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-[#002935] mb-2">PostHog Integration</h3>
        <p className="text-sm text-[#5a6a82] max-w-md mx-auto mb-4">
          Connect your PostHog project to see real-time analytics data. Configure your PostHog API key in the environment variables.
        </p>
        <div className="flex items-center justify-center gap-3">
          <code className="px-3 py-1.5 rounded-lg bg-[#f3f5f8] border border-[#e8ecf2] text-xs text-[#5a6a82] font-mono">
            NEXT_PUBLIC_POSTHOG_KEY=your_key
          </code>
        </div>
      </div>

      {/* Sentry section */}
      <div className="bg-white border border-[#e8ecf2] shadow-sm rounded-xl p-6">
        <h3 className="text-lg font-semibold text-[#002935] mb-4">Error Monitoring (Sentry)</h3>
        <p className="text-sm text-[#5a6a82]">
          Configure Sentry DSN to track errors. Recent errors will appear here once connected.
        </p>
      </div>
    </div>
  )
}
