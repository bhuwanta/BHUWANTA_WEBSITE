import { requireRole } from '../../_shared/auth';
import RegistrationsPage from '../../_shared/registrations/RegistrationsPage';

export default async function SrCoreRegistrationsPage() {
  const { userId, role } = await requireRole('sr_core');
  return <RegistrationsPage currentUserRole={role} currentUserId={userId} />;
}
