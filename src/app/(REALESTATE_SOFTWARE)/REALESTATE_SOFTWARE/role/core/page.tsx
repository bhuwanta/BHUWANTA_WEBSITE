import { requireRole } from '../_shared/auth';
import SalesDashboard from '../_shared/sales/dashboard/SalesDashboard';
import PageModuleGuard from '../_shared/PageModuleGuard';

export default async function CoreDashboardPage() {
  const { role } = await requireRole('core');
  return (
    <PageModuleGuard moduleKey="dashboard" redirectBase="/REALESTATE_SOFTWARE/role/core">
      <SalesDashboard currentUserRole={role} />
    </PageModuleGuard>
  );
}
