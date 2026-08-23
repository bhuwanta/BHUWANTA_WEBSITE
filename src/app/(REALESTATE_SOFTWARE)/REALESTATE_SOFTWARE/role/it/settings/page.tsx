import { requireRole } from '../../_shared/auth';
import SettingsPage from '../../_shared/admin/settings/SettingsPage';

export default async function ITSettingsPage() {
  await requireRole('it');
  return <SettingsPage />;
}
