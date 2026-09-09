import { requireRole } from '../../_shared/auth';
import SelfSettingsPage from '../../_shared/sales/settings/SelfSettingsPage';
import PageModuleGuard from '../../_shared/PageModuleGuard';

export default async function CustomerSettingsPage() {
  await requireRole('customer');
  return (
    <PageModuleGuard moduleKey="customer_settings">
      <SelfSettingsPage />
    </PageModuleGuard>
  );
}
