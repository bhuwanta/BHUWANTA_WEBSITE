import { requireRole } from '../../_shared/auth';
import SelfSettingsPage from '../../_shared/sales/settings/SelfSettingsPage';

export default async function SrCoreSettingsPage() {
  await requireRole('sr_core');
  return <SelfSettingsPage />;
}
