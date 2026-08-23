import { requireRole } from '../../_shared/auth';
import RegistrationsPage from '../../_shared/registrations/RegistrationsPage';

export default async function GoverningCouncilRegistrationsPage() {
  const { userId, role } = await requireRole('governing_council');
  return <RegistrationsPage currentUserRole={role} currentUserId={userId} />;
}
