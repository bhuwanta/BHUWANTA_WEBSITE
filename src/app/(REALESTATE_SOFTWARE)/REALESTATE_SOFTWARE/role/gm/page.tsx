import { requireRole } from '../_shared/auth';
import SalesDashboard from '../_shared/sales/dashboard/SalesDashboard';

export default async function GMDashboardPage() {
  const { role } = await requireRole('gm');
  return <SalesDashboard currentUserRole={role} />;
}
