'use client'

import { useState, useEffect } from 'react'
import { 
  Users, 
  PhoneOff, 
  Phone, 
  XCircle, 
  Database, 
  UserPlus, 
  Star, 
  Briefcase 
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function DashboardPage() {
  const [totalLeads, setTotalLeads] = useState<number | null>(null)
  const [todaysLeads, setTodaysLeads] = useState<number | null>(null)
  const [newLeads, setNewLeads] = useState<number | null>(null)
  const [uncontacted, setUncontacted] = useState<number | null>(null)
  const [contacted, setContacted] = useState<number | null>(null)
  const [qualified, setQualified] = useState<number | null>(null)
  const [rejected, setRejected] = useState<number | null>(null)
  const [closed, setClosed] = useState<number | null>(null)
  
  useEffect(() => {
    async function fetchLeads() {
      const supabase = createClient();
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const [
        totalRes,
        todaysRes,
        newRes,
        uncontactedRes,
        contactedRes,
        qualifiedRes,
        rejectedRes,
        closedRes
      ] = await Promise.all([
        supabase.from('leads').select('*', { count: 'exact', head: true }),
        supabase.from('leads').select('*', { count: 'exact', head: true }).gte('created_at', today.toISOString()),
        supabase.from('leads').select('*', { count: 'exact', head: true }).eq('status', 'new'),
        supabase.from('leads').select('*', { count: 'exact', head: true }).eq('status', 'uncontacted'),
        supabase.from('leads').select('*', { count: 'exact', head: true }).eq('status', 'contacted'),
        supabase.from('leads').select('*', { count: 'exact', head: true }).eq('status', 'qualified'),
        supabase.from('leads').select('*', { count: 'exact', head: true }).eq('status', 'rejected'),
        supabase.from('leads').select('*', { count: 'exact', head: true }).eq('status', 'closed')
      ]);
        
      if (!totalRes.error) setTotalLeads(totalRes.count || 0);
      if (!todaysRes.error) setTodaysLeads(todaysRes.count || 0);
      if (!newRes.error) setNewLeads(newRes.count || 0);
      if (!uncontactedRes.error) setUncontacted(uncontactedRes.count || 0);
      if (!contactedRes.error) setContacted(contactedRes.count || 0);
      if (!qualifiedRes.error) setQualified(qualifiedRes.count || 0);
      if (!rejectedRes.error) setRejected(rejectedRes.count || 0);
      if (!closedRes.error) setClosed(closedRes.count || 0);
    }
    fetchLeads();
  }, [])

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-[#0f1d33]">Dashboard Insights</h1>
        <p className="mt-2 text-sm text-[#5a6a82]">
          Overview of your CRM performance and daily activities.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <DashboardCard 
          title="Total Leads" 
          value={totalLeads !== null ? totalLeads.toString() : '...'} 
          description="All time leads"
          icon={<Database className="h-4 w-4 text-[#5a6a82]" />} 
        />
        <DashboardCard 
          title="Today's Leads" 
          value={todaysLeads !== null ? todaysLeads.toString() : '...'} 
          description="Leads received today"
          icon={<Users className="h-4 w-4 text-[#5a6a82]" />} 
        />
        <DashboardCard 
          title="New Leads" 
          value={newLeads !== null ? newLeads.toString() : '...'} 
          description="Fresh enquiries"
          icon={<UserPlus className="h-4 w-4 text-emerald-500" />} 
        />
        <DashboardCard 
          title="Uncontacted" 
          value={uncontacted !== null ? uncontacted.toString() : '...'} 
          description="Needs attention"
          icon={<PhoneOff className="h-4 w-4 text-orange-500" />} 
        />
        <DashboardCard 
          title="Contacted" 
          value={contacted !== null ? contacted.toString() : '...'} 
          description="Currently engaged"
          icon={<Phone className="h-4 w-4 text-blue-500" />} 
        />
        <DashboardCard 
          title="Qualified" 
          value={qualified !== null ? qualified.toString() : '...'} 
          description="High intent leads"
          icon={<Star className="h-4 w-4 text-purple-500" />} 
        />
        <DashboardCard 
          title="Closed" 
          value={closed !== null ? closed.toString() : '...'} 
          description="Successful deals"
          icon={<Briefcase className="h-4 w-4 text-emerald-600" />} 
        />
        <DashboardCard 
          title="Rejected" 
          value={rejected !== null ? rejected.toString() : '...'} 
          description="Lost leads"
          icon={<XCircle className="h-4 w-4 text-red-500" />} 
        />
      </div>
    </div>
  );
}

function DashboardCard({ 
  title, 
  value, 
  description, 
  icon 
}: { 
  title: string; 
  value: string; 
  description: string; 
  icon: React.ReactNode 
}) {
  return (
    <div className="rounded-xl border border-[#e8ecf2] bg-white p-6 shadow-sm">
      <div className="flex flex-row items-center justify-between space-y-0 pb-2">
        <h3 className="text-sm font-medium tracking-tight text-[#5a6a82]">{title}</h3>
        {icon}
      </div>
      <div>
        <div className="text-2xl font-bold text-[#0f1d33]">{value}</div>
        <p className="text-xs text-[#5a6a82] mt-1">{description}</p>
      </div>
    </div>
  );
}
