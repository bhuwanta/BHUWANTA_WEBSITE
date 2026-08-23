import { requireRole } from '../../_shared/auth';
import ContactPage from '../../_shared/customer/ContactPage';

export default async function CustomerContactPage() {
  await requireRole('customer');
  return <ContactPage />;
}
