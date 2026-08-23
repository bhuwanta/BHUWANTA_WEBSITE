import { requireRole } from '../../_shared/auth';
import RegistrationsPage from '../../_shared/registrations/RegistrationsPage';

export default async function ITRegistrationsPage() {
  const { userId, role } = await requireRole('it');
  return <RegistrationsPage currentUserRole={role} currentUserId={userId} />;
}
