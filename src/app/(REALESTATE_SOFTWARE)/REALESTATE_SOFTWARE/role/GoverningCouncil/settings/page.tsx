import { requireRole } from '../../_shared/auth';
import SettingsPage from '../../_shared/admin/settings/SettingsPage';

export default async function GoverningCouncilSettingsPage() {
  await requireRole('governing_council');
  return <SettingsPage />;
}
