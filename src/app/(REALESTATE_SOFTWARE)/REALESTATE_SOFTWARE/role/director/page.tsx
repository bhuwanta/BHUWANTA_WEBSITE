import { requireRole } from '../_shared/auth';
import SalesDashboard from '../_shared/sales/dashboard/SalesDashboard';
import PageModuleGuard from '../_shared/PageModuleGuard';

export default async function DirectorDashboardPage() {
  const { role } = await requireRole('director');
  return (
    <PageModuleGuard moduleKey="dashboard" redirectBase="/REALESTATE_SOFTWARE/role/director">
      <SalesDashboard currentUserRole={role} />
    </PageModuleGuard>
  );
}
