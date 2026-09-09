import { requireRole } from '../_shared/auth';
import SalesDashboard from '../_shared/sales/dashboard/SalesDashboard';
import PageModuleGuard from '../_shared/PageModuleGuard';

export default async function LIODashboardPage() {
  const { role } = await requireRole('lio');
  return (
    <PageModuleGuard moduleKey="dashboard" redirectBase="/REALESTATE_SOFTWARE/role/lio">
      <SalesDashboard currentUserRole={role} />
    </PageModuleGuard>
  );
}
