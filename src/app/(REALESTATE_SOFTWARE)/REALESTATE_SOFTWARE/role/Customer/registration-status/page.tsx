import { requireRole } from '../../_shared/auth';
import RegistrationStatusPage from '../../_shared/customer/RegistrationStatusPage';
import PageModuleGuard from '../../_shared/PageModuleGuard';

export default async function CustomerRegistrationStatusPage() {
  await requireRole('customer');
  return (
    <PageModuleGuard moduleKey="customer_registration_status">
      <RegistrationStatusPage />
    </PageModuleGuard>
  );
}
