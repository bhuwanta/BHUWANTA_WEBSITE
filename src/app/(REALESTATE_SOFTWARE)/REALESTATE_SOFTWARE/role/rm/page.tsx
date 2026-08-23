import { requireRole } from '../_shared/auth';
import SalesDashboard from '../_shared/sales/dashboard/SalesDashboard';

export default async function RMDashboardPage() {
  const { role } = await requireRole('rm');
  return <SalesDashboard currentUserRole={role} />;
}
