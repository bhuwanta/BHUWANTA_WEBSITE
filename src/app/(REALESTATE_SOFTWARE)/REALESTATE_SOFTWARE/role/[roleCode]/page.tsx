import { requireRole } from '../_shared/auth';
import SalesDashboard from '../_shared/sales/dashboard/SalesDashboard';
import type { RealEstateRole } from '../_shared/permissions';
import PageModuleGuard from '../_shared/PageModuleGuard';

export default async function DynamicRoleDashboardPage({ params }: { params: Promise<{ roleCode: string }> }) {
  const { roleCode } = await params;
  const { role } = await requireRole(roleCode as RealEstateRole);
  return (
    <PageModuleGuard moduleKey="dashboard">
      <SalesDashboard currentUserRole={role} />
    </PageModuleGuard>
  );
}
