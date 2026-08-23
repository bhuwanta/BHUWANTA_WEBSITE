import { requireRole } from '../../_shared/auth';
import RegistrationsPage from '../../_shared/registrations/RegistrationsPage';

export default async function CoreRegistrationsPage() {
  const { userId, role } = await requireRole('core');
  return <RegistrationsPage currentUserRole={role} currentUserId={userId} />;
}
