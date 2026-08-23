import { requireRole } from '../../_shared/auth';
import SelfSettingsPage from '../../_shared/sales/settings/SelfSettingsPage';

export default async function OperationManagerSettingsPage() {
  await requireRole('operation_manager');
  return <SelfSettingsPage />;
}
