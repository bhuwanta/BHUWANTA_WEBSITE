import { requireRole } from '../../_shared/auth';
import RegistrationsPage from '../../_shared/registrations/RegistrationsPage';
import type { RealEstateRole } from '../../_shared/permissions';

export default async function DynamicRoleRegistrationsPage({ params }: { params: Promise<{ roleCode: string }> }) {
  const { roleCode } = await params;
  const { userId, role } = await requireRole(roleCode as RealEstateRole);
  return <RegistrationsPage currentUserRole={role} currentUserId={userId} />;
}
