import { requireRole } from '../_shared/auth';
import SalesDashboard from '../_shared/sales/dashboard/SalesDashboard';

export default async function SrCoreDashboardPage() {
  const { role } = await requireRole('sr_core');
  return <SalesDashboard currentUserRole={role} />;
}
