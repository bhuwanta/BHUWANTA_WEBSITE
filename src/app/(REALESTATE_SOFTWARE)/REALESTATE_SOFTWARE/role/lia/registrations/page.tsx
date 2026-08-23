import { requireRole } from '../../_shared/auth';
import RegistrationsPage from '../../_shared/registrations/RegistrationsPage';

export default async function LIARegistrationsPage() {
  const { userId, role } = await requireRole('lia');
  return <RegistrationsPage currentUserRole={role} currentUserId={userId} />;
}
