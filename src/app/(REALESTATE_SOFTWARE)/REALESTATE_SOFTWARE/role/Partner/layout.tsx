'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Settings2, Receipt, LogOut, ChevronLeft, ChevronRight, Menu, Briefcase, Users } from 'lucide-react';

export default function PartnerLayout({ children }: { children: React.ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const pathname = usePathname() || '';

  // Exact match for dashboard, startsWith for others
  const isActive = (path: string, exact: boolean = false) => {
    if (exact) {
      return pathname === path;
    }
    return pathname.startsWith(path);
  };

  return (
    <div className="flex h-screen bg-[#f7f8fa] overflow-hidden">
      
      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-14 bg-white border-b border-[#e8ecf2] flex items-center justify-between px-4 z-50">
        <h2 className="text-lg font-bold text-[#0f1d33]">Bhuwanta<span className="text-[#c4a55a]">ERP</span></h2>
        <button onClick={() => setIsMobileOpen(!isMobileOpen)} className="p-2 text-[#5a6a82] hover:bg-[#f3f5f8] rounded-lg">
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-[#0f1d33]/50 z-40 backdrop-blur-sm"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <aside className={`
        fixed md:static inset-y-0 left-0 z-50 bg-white border-r border-[#e8ecf2] flex flex-col shrink-0 transition-all duration-300 ease-in-out relative
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        ${isCollapsed ? 'w-20' : 'w-56'}
      `}>
        
        {/* Floating Collapse Button */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden md:flex items-center justify-center w-7 h-7 absolute -right-3.5 top-6 bg-white border border-[#e8ecf2] rounded-full text-[#5a6a82] hover:text-[#c4a55a] hover:border-[#c4a55a] hover:shadow-md transition-all shadow-sm z-50"
          title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4 ml-0.5" /> : <ChevronLeft className="w-4 h-4 mr-0.5" />}
        </button>

        <div className={`p-4 border-b border-[#e8ecf2] flex items-center h-[76px] ${isCollapsed ? 'justify-center' : 'justify-start'}`}>
          {!isCollapsed && (
            <div className="overflow-hidden whitespace-nowrap animate-in fade-in duration-300">
              <h2 className="text-xl font-bold text-[#0f1d33]">Bhuwanta<span className="text-[#c4a55a]">ERP</span></h2>
              <p className="text-[10px] text-[#5a6a82] mt-0.5 font-bold uppercase tracking-widest">Partner Module</p>
            </div>
          )}
        </div>
        
        <nav className="flex-1 p-3 space-y-2 overflow-y-auto mt-2">
          <Link 
            href="/REALESTATE_SOFTWARE/role/Partner" 
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors group ${isActive('/REALESTATE_SOFTWARE/role/Partner', true) ? 'text-[#1e3a5f] bg-[#1e3a5f]/10' : 'text-[#5a6a82] hover:bg-[#f3f5f8]'}`}
            title="Dashboard"
            onClick={() => setIsMobileOpen(false)}
          >
            <LayoutDashboard className="w-5 h-5 shrink-0" />
            {!isCollapsed && <span>Dashboard</span>}
          </Link>

          <Link 
            href="/REALESTATE_SOFTWARE/role/Partner/projects" 
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors group ${isActive('/REALESTATE_SOFTWARE/role/Partner/projects') ? 'text-[#1e3a5f] bg-[#1e3a5f]/10' : 'text-[#5a6a82] hover:bg-[#f3f5f8]'}`}
            title="Projects"
            onClick={() => setIsMobileOpen(false)}
          >
            <Briefcase className="w-5 h-5 shrink-0" />
            {!isCollapsed && <span>Projects</span>}
          </Link>

          <Link 
            href="/REALESTATE_SOFTWARE/role/Partner/users" 
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors group ${isActive('/REALESTATE_SOFTWARE/role/Partner/users') ? 'text-[#1e3a5f] bg-[#1e3a5f]/10' : 'text-[#5a6a82] hover:bg-[#f3f5f8]'}`}
            title="Users"
            onClick={() => setIsMobileOpen(false)}
          >
            <Users className="w-5 h-5 shrink-0" />
            {!isCollapsed && <span>Users</span>}
          </Link>

          <Link 
            href="/REALESTATE_SOFTWARE/role/Partner/allocations" 
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors group ${isActive('/REALESTATE_SOFTWARE/role/Partner/allocations') ? 'text-[#1e3a5f] bg-[#1e3a5f]/10' : 'text-[#5a6a82] hover:bg-[#f3f5f8]'}`}
            title="Allocations"
            onClick={() => setIsMobileOpen(false)}
          >
            <Settings2 className="w-5 h-5 shrink-0" />
            {!isCollapsed && <span>Allocations</span>}
          </Link>

          <Link 
            href="/REALESTATE_SOFTWARE/role/Partner/wing-leaders" 
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors group ${isActive('/REALESTATE_SOFTWARE/role/Partner/wing-leaders') ? 'text-[#1e3a5f] bg-[#1e3a5f]/10' : 'text-[#5a6a82] hover:bg-[#f3f5f8]'}`}
            title="Wing Leaders"
            onClick={() => setIsMobileOpen(false)}
          >
            <Users className="w-5 h-5 shrink-0" />
            {!isCollapsed && <span>Wing Leaders</span>}
          </Link>

          <Link 
            href="/REALESTATE_SOFTWARE/role/Partner/payouts" 
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors group ${isActive('/REALESTATE_SOFTWARE/role/Partner/payouts') ? 'text-[#1e3a5f] bg-[#1e3a5f]/10' : 'text-[#5a6a82] hover:bg-[#f3f5f8]'}`}
            title="Registration/Payout"
            onClick={() => setIsMobileOpen(false)}
          >
            <Receipt className="w-5 h-5 shrink-0" />
            {!isCollapsed && <span>Registration/Payout</span>}
          </Link>

          <Link 
            href="/REALESTATE_SOFTWARE/role/Partner/settings" 
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors group ${isActive('/REALESTATE_SOFTWARE/role/Partner/settings') ? 'text-[#1e3a5f] bg-[#1e3a5f]/10' : 'text-[#5a6a82] hover:bg-[#f3f5f8]'}`}
            title="Settings"
            onClick={() => setIsMobileOpen(false)}
          >
            <Settings2 className="w-5 h-5 shrink-0" />
            {!isCollapsed && <span>Settings</span>}
          </Link>
        </nav>

        <div className="p-3 border-t border-[#e8ecf2] shrink-0 flex flex-col gap-2">
          <Link 
            href="/REALESTATE_SOFTWARE/login" 
            className="flex items-center gap-3 px-3 py-2.5 text-red-600 hover:bg-red-50 rounded-lg text-sm font-semibold transition-colors"
            title="Sign Out"
          >
            <LogOut className="w-5 h-5 shrink-0" />
            {!isCollapsed && <span>Sign Out</span>}
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto bg-[#f7f8fa] pt-14 md:pt-0">
        <div className="flex-1 flex flex-col p-4 md:p-6 min-h-0 w-full mx-auto max-w-7xl">
          {children}
        </div>
      </main>
    </div>
  );
}
