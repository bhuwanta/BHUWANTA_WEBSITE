'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, ClipboardPlus, ClipboardList, Users, Building2, Wallet, Settings, LogOut, ChevronLeft, ChevronRight, Menu } from 'lucide-react';
import { getPendingRegistrationCountAction } from '../registrations/actions';
import { onRegistrationsChanged } from '../registrations-notify';

interface SalesLayoutProps {
  children: React.ReactNode;
  /** URL base for this role's shell, e.g. "/REALESTATE_SOFTWARE/role/director" —
   * every sales tier shares an identical page set (HIERARCHY.md §8), only
   * scope/data differs. */
  basePath: string;
  roleLabel: string;
  /** LIA has no downline, so its User Management page doesn't exist at
   * all (§8h) — not shown empty, dropped from the nav entirely. */
  showUserManagement: boolean;
}

export default function SalesLayout({ children, basePath, roleLabel, showUserManagement }: SalesLayoutProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const pathname = usePathname() || '';

  useEffect(() => {
    const refresh = () => {
      getPendingRegistrationCountAction().then((res) => {
        if (res.success) setPendingCount(res.count);
      });
    };
    refresh();
    // Also refreshes the instant a registration is submitted/marked
    // done/cancelled anywhere on the page — not just on navigation.
    return onRegistrationsChanged(refresh);
  }, [pathname]);

  const navItems = [
    { path: '', label: 'Dashboard', icon: LayoutDashboard, exact: true },
    { path: '/new-registration', label: 'New Registration', icon: ClipboardPlus },
    { path: '/registrations', label: 'Registrations', icon: ClipboardList },
    ...(showUserManagement ? [{ path: '/users', label: 'User Management', icon: Users }] : []),
    { path: '/projects', label: 'My Projects', icon: Building2 },
    { path: '/wallet', label: 'My Wallet', icon: Wallet },
    { path: '/settings', label: 'Settings', icon: Settings },
  ];

  const isActive = (path: string, exact?: boolean) => {
    const full = `${basePath}${path}`;
    return exact ? pathname === full : pathname.startsWith(full);
  };

  return (
    <div className="flex h-screen bg-[#f7f8fa] overflow-hidden">
      <div className="md:hidden fixed top-0 left-0 right-0 h-14 bg-white border-b border-[#e8ecf2] flex items-center justify-between px-4 z-50">
        <h2 className="text-lg font-bold text-[#0f1d33]">
          Bhuwanta<span className="text-[#c4a55a]">ERP</span>
        </h2>
        <button onClick={() => setIsMobileOpen(!isMobileOpen)} className="p-2 text-[#5a6a82] hover:bg-[#f3f5f8] rounded-lg">
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {isMobileOpen && <div className="md:hidden fixed inset-0 bg-[#0f1d33]/50 z-40 backdrop-blur-sm" onClick={() => setIsMobileOpen(false)} />}

      <aside
        className={`fixed md:static inset-y-0 left-0 z-50 bg-white border-r border-[#e8ecf2] flex flex-col shrink-0 transition-all duration-300 ease-in-out relative ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        } ${isCollapsed ? 'w-20' : 'w-56'}`}
      >
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden md:flex items-center justify-center w-7 h-7 absolute -right-3.5 top-6 bg-white border border-[#e8ecf2] rounded-full text-[#5a6a82] hover:text-[#c4a55a] hover:border-[#c4a55a] hover:shadow-md transition-all shadow-sm z-50"
          title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4 ml-0.5" /> : <ChevronLeft className="w-4 h-4 mr-0.5" />}
        </button>

        <div className={`p-4 border-b border-[#e8ecf2] flex items-center h-[76px] ${isCollapsed ? 'justify-center' : 'justify-start'}`}>
          {!isCollapsed && (
            <div className="overflow-hidden whitespace-nowrap animate-in fade-in duration-300">
              <h2 className="text-xl font-bold text-[#0f1d33]">
                Bhuwanta<span className="text-[#c4a55a]">ERP</span>
              </h2>
              <p className="text-[10px] text-[#5a6a82] mt-0.5 font-bold uppercase tracking-widest">{roleLabel}</p>
            </div>
          )}
        </div>

        <nav className="flex-1 p-3 space-y-2 overflow-y-auto mt-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const href = `${basePath}${item.path}`;
            const active = isActive(item.path, item.exact);
            return (
              <Link
                key={item.path}
                href={href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors group relative ${
                  active ? 'text-[#1e3a5f] bg-[#1e3a5f]/10' : 'text-[#5a6a82] hover:bg-[#f3f5f8]'
                }`}
                title={item.path === '/registrations' && pendingCount > 0 ? `${item.label} — ${pendingCount} pending` : item.label}
                onClick={() => setIsMobileOpen(false)}
              >
                <span className="relative shrink-0">
                  <Icon className="w-5 h-5" />
                  {isCollapsed && item.path === '/registrations' && pendingCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[9px] font-bold rounded-full min-w-[16px] h-4 px-1 flex items-center justify-center">
                      {pendingCount > 9 ? '9+' : pendingCount}
                    </span>
                  )}
                </span>
                {!isCollapsed && (
                  <span className="flex-1 flex items-center justify-between">
                    {item.label}
                    {item.path === '/registrations' && pendingCount > 0 && (
                      <span className="bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] px-1 flex items-center justify-center">
                        {pendingCount > 99 ? '99+' : pendingCount}
                      </span>
                    )}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-[#e8ecf2] shrink-0 flex flex-col gap-2">
          <Link href="/REALESTATE_SOFTWARE/login" className="flex items-center gap-3 px-3 py-2.5 text-red-600 hover:bg-red-50 rounded-lg text-sm font-semibold transition-colors" title="Sign Out">
            <LogOut className="w-5 h-5 shrink-0" />
            {!isCollapsed && <span>Sign Out</span>}
          </Link>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto pt-14 md:pt-0">{children}</main>
    </div>
  );
}
