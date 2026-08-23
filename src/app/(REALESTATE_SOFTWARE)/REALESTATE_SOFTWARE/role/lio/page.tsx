import { requireRole } from '../_shared/auth';
import SalesDashboard from '../_shared/sales/dashboard/SalesDashboard';

export default async function LIODashboardPage() {
  const { role } = await requireRole('lio');
  return <SalesDashboard currentUserRole={role} />;
}
