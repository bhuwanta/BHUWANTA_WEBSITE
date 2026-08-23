import { requireRole } from '../_shared/auth';
import SalesDashboard from '../_shared/sales/dashboard/SalesDashboard';

export default async function CoreDashboardPage() {
  const { role } = await requireRole('core');
  return <SalesDashboard currentUserRole={role} />;
}
