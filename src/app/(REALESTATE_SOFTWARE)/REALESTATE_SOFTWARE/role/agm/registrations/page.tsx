import { requireRole } from '../../_shared/auth';
import RegistrationsPage from '../../_shared/registrations/GuardedRegistrationsPage';

export default async function AGMRegistrationsPage() {
  const { userId, role } = await requireRole('agm');
  return <RegistrationsPage currentUserRole={role} currentUserId={userId} />;
}
