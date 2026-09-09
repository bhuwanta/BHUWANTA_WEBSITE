import { requireRole } from '../../_shared/auth';
import ContactPage from '../../_shared/customer/ContactPage';
import PageModuleGuard from '../../_shared/PageModuleGuard';

export default async function CustomerContactPage() {
  await requireRole('customer');
  return (
    <PageModuleGuard moduleKey="customer_contact">
      <ContactPage />
    </PageModuleGuard>
  );
}
