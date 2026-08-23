import { requireRole } from '../../_shared/auth';
import RegistrationsPage from '../../_shared/registrations/RegistrationsPage';

export default async function AGMRegistrationsPage() {
  const { userId, role } = await requireRole('agm');
  return <RegistrationsPage currentUserRole={role} currentUserId={userId} />;
}
