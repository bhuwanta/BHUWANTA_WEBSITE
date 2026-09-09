import { requireRole } from '../_shared/auth';
import SalesDashboard from '../_shared/sales/dashboard/SalesDashboard';
import PageModuleGuard from '../_shared/PageModuleGuard';

export default async function GMDashboardPage() {
  const { role } = await requireRole('gm');
  return (
    <PageModuleGuard moduleKey="dashboard" redirectBase="/REALESTATE_SOFTWARE/role/gm">
      <SalesDashboard currentUserRole={role} />
    </PageModuleGuard>
  );
}
