import { requireRole } from '../../_shared/auth';
import RegistrationsPage from '../../_shared/registrations/GuardedRegistrationsPage';

export default async function DirectorRegistrationsPage() {
  const { userId, role } = await requireRole('director');
  return <RegistrationsPage currentUserRole={role} currentUserId={userId} />;
}
