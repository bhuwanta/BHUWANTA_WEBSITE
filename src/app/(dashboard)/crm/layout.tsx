'use client'

import { useState, useEffect } from 'react'
import { Sidebar } from "@/components/dashboard/Sidebar"
import { createClient } from "@/lib/supabase/client"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [userRole, setUserRole] = useState<string>('Admin')

  useEffect(() => {
    async function fetchRole() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUserRole(user.user_metadata?.role || 'Admin')
      }
    }
    fetchRole()
  }, [])

  return (
    <div className="flex h-screen w-full bg-[#f7f8fa] overflow-hidden">
      {/* Sidebar - hidden on mobile by default */}
      <div className={`hidden md:flex flex-col transition-all duration-300 ${isCollapsed ? 'md:w-20' : 'md:w-64'}`}>
        <Sidebar isCollapsed={isCollapsed} toggleCollapse={() => setIsCollapsed(!isCollapsed)} userRole={userRole} />
      </div>
      
      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto overflow-x-hidden p-6 md:p-8">
        <div className="mx-auto max-w-7xl">
          {children}
        </div>
      </main>
    </div>
  )
}
