import { requireRole } from '../../_shared/auth';
import PayoutsPage from '../../_shared/admin/payouts/PayoutsPage';

export default async function OperationManagerPayoutsPage() {
  await requireRole('operation_manager');
  return <PayoutsPage currentUserRole="operation_manager" />;
}
