import { requireRole } from '../../_shared/auth';
import SettingsPage from '../../_shared/admin/settings/SettingsPage';

export default async function CEOSettingsPage() {
  await requireRole('ceo');
  return <SettingsPage />;
}
