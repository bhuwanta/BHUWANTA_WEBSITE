import { requireRole } from '../../_shared/auth';
import SelfSettingsPage from '../../_shared/sales/settings/SelfSettingsPage';

export default async function LIOSettingsPage() {
  await requireRole('lio');
  return <SelfSettingsPage />;
}
