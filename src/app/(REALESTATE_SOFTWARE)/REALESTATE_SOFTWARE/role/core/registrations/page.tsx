import { requireRole } from '../../_shared/auth';
import RegistrationsPage from '../../_shared/registrations/GuardedRegistrationsPage';

export default async function CoreRegistrationsPage() {
  const { userId, role } = await requireRole('core');
  return <RegistrationsPage currentUserRole={role} currentUserId={userId} />;
}
