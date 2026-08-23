import { requireRole } from '../../_shared/auth';
import SelfSettingsPage from '../../_shared/sales/settings/SelfSettingsPage';

export default async function DirectorSettingsPage() {
  await requireRole('director');
  return <SelfSettingsPage />;
}
