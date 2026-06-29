import { 
  Users, 
  PhoneCall, 
  CalendarDays
} from "lucide-react";

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Dashboard Insights</h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Overview of your CRM performance and daily activities.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <DashboardCard 
          title="Today's Leads" 
          value="12" 
          description="+2 from yesterday"
          icon={<Users className="h-4 w-4 text-gray-500" />} 
        />
        <DashboardCard 
          title="Pending Callbacks" 
          value="5" 
          description="Requires attention"
          icon={<PhoneCall className="h-4 w-4 text-orange-500" />} 
        />
        <DashboardCard 
          title="Scheduled Appointments" 
          value="3" 
          description="For this week"
          icon={<CalendarDays className="h-4 w-4 text-blue-500" />} 
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
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-950">
      <div className="flex flex-row items-center justify-between space-y-0 pb-2">
        <h3 className="text-sm font-medium tracking-tight text-gray-600 dark:text-gray-400">{title}</h3>
        {icon}
      </div>
      <div>
        <div className="text-2xl font-bold text-gray-900 dark:text-white">{value}</div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{description}</p>
      </div>
    </div>
  );
}
