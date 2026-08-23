import { requireRole } from '../../_shared/auth';
import SelfSettingsPage from '../../_shared/sales/settings/SelfSettingsPage';

export default async function RMSettingsPage() {
  await requireRole('rm');
  return <SelfSettingsPage />;
}
