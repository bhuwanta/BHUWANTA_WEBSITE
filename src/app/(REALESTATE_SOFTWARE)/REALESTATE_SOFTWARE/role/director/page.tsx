import { requireRole } from '../_shared/auth';
import SalesDashboard from '../_shared/sales/dashboard/SalesDashboard';

export default async function DirectorDashboardPage() {
  const { role } = await requireRole('director');
  return <SalesDashboard currentUserRole={role} />;
}
