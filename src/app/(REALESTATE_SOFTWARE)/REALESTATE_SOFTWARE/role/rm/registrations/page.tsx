import { requireRole } from '../../_shared/auth';
import RegistrationsPage from '../../_shared/registrations/GuardedRegistrationsPage';

export default async function RMRegistrationsPage() {
  const { userId, role } = await requireRole('rm');
  return <RegistrationsPage currentUserRole={role} currentUserId={userId} />;
}
