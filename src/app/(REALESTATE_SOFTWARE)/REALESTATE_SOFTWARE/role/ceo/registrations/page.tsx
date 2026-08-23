import { requireRole } from '../../_shared/auth';
import RegistrationsPage from '../../_shared/registrations/RegistrationsPage';

export default async function CEORegistrationsPage() {
  const { userId, role } = await requireRole('ceo');
  return <RegistrationsPage currentUserRole={role} currentUserId={userId} />;
}
