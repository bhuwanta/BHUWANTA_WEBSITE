import { requireRole } from '../../_shared/auth';
import RegistrationsPage from '../../_shared/registrations/RegistrationsPage';

export default async function CompanyRegistrationsPage() {
  const { userId, role } = await requireRole('company');
  return <RegistrationsPage currentUserRole={role} currentUserId={userId} />;
}
