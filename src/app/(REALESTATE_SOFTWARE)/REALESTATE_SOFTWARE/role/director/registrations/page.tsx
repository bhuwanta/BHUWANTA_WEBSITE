import { requireRole } from '../../_shared/auth';
import RegistrationsPage from '../../_shared/registrations/RegistrationsPage';

export default async function DirectorRegistrationsPage() {
  const { userId, role } = await requireRole('director');
  return <RegistrationsPage currentUserRole={role} currentUserId={userId} />;
}
