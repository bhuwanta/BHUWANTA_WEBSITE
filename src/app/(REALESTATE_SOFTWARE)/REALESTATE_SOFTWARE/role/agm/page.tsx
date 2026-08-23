import { requireRole } from '../_shared/auth';
import SalesDashboard from '../_shared/sales/dashboard/SalesDashboard';

export default async function AGMDashboardPage() {
  const { role } = await requireRole('agm');
  return <SalesDashboard currentUserRole={role} />;
}
