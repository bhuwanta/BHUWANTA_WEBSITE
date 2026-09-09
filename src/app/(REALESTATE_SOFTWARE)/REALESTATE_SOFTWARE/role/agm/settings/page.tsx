import { requireRole } from '../../_shared/auth';
import SelfSettingsPage from '../../_shared/sales/settings/SelfSettingsPage';
import PageModuleGuard from '../../_shared/PageModuleGuard';

export default async function AGMSettingsPage() {
  await requireRole('agm');
  return (
    <PageModuleGuard moduleKey="settings">
      <SelfSettingsPage />
    </PageModuleGuard>
  );
}
