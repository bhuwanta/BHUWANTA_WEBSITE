import { requireRole } from '../_shared/auth';
import SalesDashboard from '../_shared/sales/dashboard/SalesDashboard';

export default async function LIADashboardPage() {
  const { role } = await requireRole('lia');
  return <SalesDashboard currentUserRole={role} />;
}
