import { requireRole } from '../../_shared/auth';
import RegistrationStatusPage from '../../_shared/customer/RegistrationStatusPage';

export default async function CustomerRegistrationStatusPage() {
  await requireRole('customer');
  return <RegistrationStatusPage />;
}
