import { requireRole } from '../_shared/auth';
import OperationManagerDashboard from '../_shared/operation-manager/OperationManagerDashboard';

export default async function OperationManagerDashboardPage() {
  await requireRole('operation_manager');
  return <OperationManagerDashboard />;
}
