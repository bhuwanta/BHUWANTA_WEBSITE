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
  LogOut
} from "lucide-react";

const navigation = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Leads', href: '/admin/leads', icon: Users },
  { name: 'Areas', href: '/admin/areas', icon: MapPin },
  { name: 'Projects', href: '/admin/projects', icon: Building2 },
  { name: 'Brochures', href: '/admin/brochures', icon: FileText },
  { name: 'Layouts', href: '/admin/layouts', icon: Map },
  { name: 'Reports', href: '/admin/reports', icon: LineChart },
  { name: 'Analytics', href: '/admin/analytics', icon: PieChart },
  { name: 'Settings', href: '/admin/settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col overflow-y-auto border-r border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950">
      <div className="flex h-16 shrink-0 items-center border-b px-6">
        <Link href="/admin" className="flex items-center gap-2 font-bold text-xl tracking-tight">
          <Building2 className="h-6 w-6 text-blue-600" />
          <span>Bhuwanta<span className="text-blue-600">CRM</span></span>
        </Link>
      </div>
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                isActive
                  ? "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400"
                  : "text-gray-700 hover:bg-gray-50 hover:text-blue-600 dark:text-gray-300 dark:hover:bg-gray-900 dark:hover:text-blue-400",
                "group flex items-center rounded-md px-3 py-2.5 text-sm font-medium transition-colors"
              )}
            >
              <item.icon
                className={cn(
                  isActive ? "text-blue-700 dark:text-blue-400" : "text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400",
                  "mr-3 h-5 w-5 flex-shrink-0 transition-colors"
                )}
                aria-hidden="true"
              />
              {item.name}
            </Link>
          );
        })}
      </nav>
      <div className="border-t p-4">
        <Link
          href="/login"
          className="group flex w-full items-center rounded-md px-3 py-2.5 text-sm font-medium bg-red-600 text-white hover:bg-red-700 transition-colors dark:bg-red-700 dark:hover:bg-red-800"
        >
          <LogOut className="mr-3 h-5 w-5 flex-shrink-0 text-white" aria-hidden="true" />
          Logout
        </Link>
      </div>
    </div>
  );
}
