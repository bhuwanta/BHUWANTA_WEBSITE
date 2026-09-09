import { requireRole } from '../_shared/auth';
import SalesDashboard from '../_shared/sales/dashboard/SalesDashboard';
import PageModuleGuard from '../_shared/PageModuleGuard';

export default async function AGMDashboardPage() {
  const { role } = await requireRole('agm');
  return (
    <PageModuleGuard moduleKey="dashboard" redirectBase="/REALESTATE_SOFTWARE/role/agm">
      <SalesDashboard currentUserRole={role} />
    </PageModuleGuard>
  );
}
