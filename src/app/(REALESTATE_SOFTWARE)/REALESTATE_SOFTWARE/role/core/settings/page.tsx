import { requireRole } from '../../_shared/auth';
import SelfSettingsPage from '../../_shared/sales/settings/SelfSettingsPage';

export default async function CoreSettingsPage() {
  await requireRole('core');
  return <SelfSettingsPage />;
}
