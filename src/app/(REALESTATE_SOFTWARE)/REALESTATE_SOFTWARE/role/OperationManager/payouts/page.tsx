import { requireRole } from '../../_shared/auth';
import PayoutsPage from '../../_shared/admin/payouts/PayoutsPage';
import PageModuleGuard from '../../_shared/PageModuleGuard';

export default async function OperationManagerPayoutsPage() {
  await requireRole('operation_manager');
  return (
    <PageModuleGuard moduleKey="payouts">
      <PayoutsPage currentUserRole="operation_manager" />
    </PageModuleGuard>
  );
}
