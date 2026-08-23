import { requireRole } from '../../_shared/auth';
import RegistrationsPage from '../../_shared/registrations/RegistrationsPage';

export default async function GMRegistrationsPage() {
  const { userId, role } = await requireRole('gm');
  return <RegistrationsPage currentUserRole={role} currentUserId={userId} />;
}
