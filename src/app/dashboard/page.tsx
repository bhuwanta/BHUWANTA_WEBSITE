import { createClient } from '@/lib/supabase/server'
import { Image as ImageIcon, Briefcase, Users, FileText, TrendingUp, Mail } from 'lucide-react'
import Link from 'next/link'

export default async function DashboardPage() {
  let leadCount = 0
  let jobCount = 0

  try {
    const supabase = await createClient()
    const [leads, jobs] = await Promise.all([
      supabase.from('leads').select('id', { count: 'exact', head: true }),
      supabase.from('job_listings').select('id', { count: 'exact', head: true }).eq('is_active', true),
    ])
    leadCount = leads.count || 0
    jobCount = jobs.count || 0
  } catch { /* fallback */ }

  const stats = [
    { label: 'Total Leads', value: leadCount, icon: Users, href: '/dashboard/leads', color: 'text-blue-600' },
    { label: 'Active Jobs', value: jobCount, icon: Briefcase, href: '/dashboard/jobs', color: 'text-emerald-600' },
    { label: 'Media Manager', value: 'Sync', icon: ImageIcon, href: '/dashboard/media', color: 'text-purple-600' },
    { label: 'Pages Configured', value: 7, icon: FileText, href: '/dashboard/seo', color: 'text-amber-600' },
  ]

  const quickActions = [
    { label: 'Upload Media', href: '/dashboard/media', icon: ImageIcon },
    { label: 'Post a Job', href: '/dashboard/jobs', icon: Briefcase },
    { label: 'SEO Settings', href: '/dashboard/seo', icon: TrendingUp },
    { label: 'Email Campaigns', href: '/dashboard/email', icon: Mail },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-[#002935] mb-1">Dashboard Overview</h1>
        <p className="text-sm text-[#5a6a82]">Manage your real estate platform from one place.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="bg-white rounded-xl p-5 border border-[#e8ecf2] shadow-sm transition-all duration-200 hover:border-[#003d4f]/20 hover:shadow-md hover:scale-[1.02]"
          >
            <div className="flex items-center justify-between mb-3">
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </div>
            <p className="text-3xl font-bold text-[#002935]">{stat.value}</p>
            <p className="text-xs text-[#5a6a82] mt-1">{stat.label}</p>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-semibold text-[#002935] mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action) => (
            <Link
              key={action.label}
              href={action.href}
              className="flex items-center gap-3 px-4 py-3 rounded-lg border border-[#e8ecf2] bg-white hover:bg-[#f3f5f8] hover:border-[#003d4f]/20 transition-all duration-200 text-sm font-medium text-[#002935] shadow-sm"
            >
              <action.icon className="w-4 h-4 text-[#003d4f]" />
              {action.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
