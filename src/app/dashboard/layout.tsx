'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'
import {
  Building2, Image as ImageIcon, Briefcase, Search, Globe, Users, BarChart3,
  Mail, Settings, LogOut, Menu, X, ChevronRight, Home
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'

const sidebarLinks = [
  { href: '/dashboard', icon: Home, label: 'Overview' },
  { href: '/dashboard/media', icon: ImageIcon, label: 'Media Manager' },
  { href: '/dashboard/jobs', icon: Briefcase, label: 'Job Posts' },
  { href: '/dashboard/seo', icon: Search, label: 'SEO Tools' },
  { href: '/dashboard/aeo-geo', icon: Globe, label: 'AEO / GEO' },
  { href: '/dashboard/leads', icon: Users, label: 'Leads' },
  { href: '/dashboard/analytics', icon: BarChart3, label: 'Analytics' },
  { href: '/dashboard/email', icon: Mail, label: 'Email Tools' },
  { href: '/dashboard/settings', icon: Settings, label: 'Settings' },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Skip layout for login page
  if (pathname === '/dashboard/login') {
    return <>{children}</>
  }

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/dashboard/login')
    router.refresh()
  }

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div className="p-6 border-b border-[#e8ecf2]">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg gradient-gold flex items-center justify-center">
            <Building2 className="w-4 h-4 text-white" />
          </div>
          <div>
            <span className="font-bold text-[#002935] text-sm">BHUWANTA</span>
            <span className="block text-[10px] text-[#5a6a82]">Dashboard</span>
          </div>
        </Link>
      </div>

      {/* Nav Links */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {sidebarLinks.map((link) => {
          const isActive = pathname === link.href || 
            (link.href !== '/dashboard' && pathname.startsWith(link.href))
          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setSidebarOpen(false)}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-[#003d4f]/10 text-[#003d4f] border border-[#003d4f]/20'
                  : 'text-[#5a6a82] hover:text-[#002935] hover:bg-[#f3f5f8]'
              )}
            >
              <link.icon className="w-4 h-4 shrink-0" />
              {link.label}
              {isActive && <ChevronRight className="w-3 h-3 ml-auto" />}
            </Link>
          )
        })}
      </nav>

      {/* Logout */}
      <div className="p-3 border-t border-[#e8ecf2]">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-[#5a6a82] hover:text-red-600 hover:bg-red-50 transition-all duration-200 w-full"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </>
  )

  return (
    <div className="min-h-screen bg-[#f7f8fa] flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 shrink-0 border-r border-[#e8ecf2] bg-white">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-[#002935]/40 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-64 bg-white border-r border-[#e8ecf2] flex flex-col shadow-xl">
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="h-16 border-b border-[#e8ecf2] flex items-center justify-between px-4 lg:px-8 shrink-0 bg-white">
          <button
            className="lg:hidden p-2 text-[#5a6a82] hover:text-[#002935]"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="text-sm font-medium text-[#5a6a82] hidden lg:block">
            {sidebarLinks.find(l => l.href === pathname || (l.href !== '/dashboard' && pathname.startsWith(l.href)))?.label || 'Dashboard'}
          </div>
          <Link
            href="/"
            target="_blank"
            className="text-xs text-[#5a6a82] hover:text-[#002935] transition-colors"
          >
            View Site →
          </Link>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 lg:p-8 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
