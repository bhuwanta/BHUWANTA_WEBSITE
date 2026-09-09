import { requireRole } from '../_shared/auth';
import SalesDashboard from '../_shared/sales/dashboard/SalesDashboard';
import PageModuleGuard from '../_shared/PageModuleGuard';

export default async function RMDashboardPage() {
  const { role } = await requireRole('rm');
  return (
    <PageModuleGuard moduleKey="dashboard" redirectBase="/REALESTATE_SOFTWARE/role/rm">
      <SalesDashboard currentUserRole={role} />
    </PageModuleGuard>
  );
}
