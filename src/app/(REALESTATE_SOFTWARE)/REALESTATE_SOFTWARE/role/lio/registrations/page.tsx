import { requireRole } from '../../_shared/auth';
import RegistrationsPage from '../../_shared/registrations/GuardedRegistrationsPage';

export default async function LIORegistrationsPage() {
  const { userId, role } = await requireRole('lio');
  return <RegistrationsPage currentUserRole={role} currentUserId={userId} />;
}
