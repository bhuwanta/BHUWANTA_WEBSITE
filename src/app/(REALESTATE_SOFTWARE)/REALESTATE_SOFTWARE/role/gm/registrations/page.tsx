import { requireRole } from '../../_shared/auth';
import RegistrationsPage from '../../_shared/registrations/GuardedRegistrationsPage';

export default async function GMRegistrationsPage() {
  const { userId, role } = await requireRole('gm');
  return <RegistrationsPage currentUserRole={role} currentUserId={userId} />;
}
