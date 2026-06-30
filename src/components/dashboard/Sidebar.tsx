import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  MapPin,
  Building2,
  FileText,
  Map,
  LineChart,
  PieChart,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Link as LinkIcon
} from "lucide-react";

const navigation = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Leads', href: '/admin/leads', icon: Users },
  { name: 'Areas', href: '/admin/areas', icon: MapPin },
  { name: 'Projects', href: '/admin/projects', icon: Building2 },
  { name: 'Brochures', href: '/admin/brochures', icon: FileText },
  { name: 'Layouts', href: '/admin/layouts', icon: Map },
  { name: 'Link Documents', href: '/admin/link-documents', icon: LinkIcon },
  { name: 'Reports', href: '/admin/reports', icon: LineChart },
  { name: 'Analytics', href: '/admin/analytics', icon: PieChart },
  { name: 'Settings', href: '/admin/settings', icon: Settings },
];

interface SidebarProps {
  isCollapsed: boolean;
  toggleCollapse: () => void;
}

export function Sidebar({ isCollapsed, toggleCollapse }: SidebarProps) {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col overflow-y-auto border-r border-[#e8ecf2] bg-white">
      <div className={cn("flex h-16 shrink-0 items-center border-b border-[#e8ecf2]", isCollapsed ? "px-0 justify-center" : "px-6 justify-between")}>
        {!isCollapsed && (
          <Link href="/admin" className="flex items-center gap-2 font-bold text-xl tracking-tight text-[#0f1d33]">
            <Building2 className="h-6 w-6 text-[#c4a55a]" />
            <span>Bhuwanta<span className="text-[#c4a55a]">CRM</span></span>
          </Link>
        )}
        <button 
          onClick={toggleCollapse} 
          className={cn("text-[#5a6a82] hover:text-[#0f1d33] hover:bg-[#f3f5f8] rounded-md p-1.5 transition-colors", isCollapsed && "mx-auto")}
          title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          {isCollapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
        </button>
      </div>
      <nav className={cn("flex-1 space-y-1 py-4", isCollapsed ? "px-2" : "px-3")}>
        {navigation.map((item) => {
          const isActive = item.href === '/admin' 
            ? pathname === item.href 
            : pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                isActive
                  ? "bg-[#1e3a5f]/10 text-[#1e3a5f]"
                  : "text-[#5a6a82] hover:bg-[#f3f5f8] hover:text-[#0f1d33]",
                "group flex items-center rounded-md text-sm font-medium transition-colors",
                isCollapsed ? "justify-center py-3 px-2" : "px-3 py-2.5"
              )}
              title={isCollapsed ? item.name : undefined}
            >
              <item.icon
                className={cn(
                  isActive ? "text-[#1e3a5f]" : "text-[#5a6a82] group-hover:text-[#0f1d33]",
                  isCollapsed ? "h-6 w-6" : "mr-3 h-5 w-5",
                  "flex-shrink-0 transition-colors"
                )}
                aria-hidden="true"
              />
              {!isCollapsed && <span>{item.name}</span>}
            </Link>
          );
        })}
      </nav>
      <div className={cn("border-t border-[#e8ecf2] p-4 flex", isCollapsed ? "justify-center" : "")}>
        <Link
          href="/login"
          className={cn(
            "group flex items-center rounded-md font-medium bg-red-50 text-red-600 hover:bg-red-100 transition-colors",
            isCollapsed ? "p-2.5 justify-center" : "w-full px-3 py-2.5 text-sm"
          )}
          title={isCollapsed ? "Logout" : undefined}
        >
          <LogOut className={cn("flex-shrink-0 text-red-600", isCollapsed ? "h-6 w-6" : "mr-3 h-5 w-5")} aria-hidden="true" />
          {!isCollapsed && <span>Logout</span>}
        </Link>
      </div>
    </div>
  );
}
