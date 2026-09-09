import { requireRole } from '../../_shared/auth';
import GuardedRegistrationsPage from '../../_shared/registrations/GuardedRegistrationsPage';
import type { RealEstateRole } from '../../_shared/permissions';

export default async function DynamicRoleRegistrationsPage({ params }: { params: Promise<{ roleCode: string }> }) {
  const { roleCode } = await params;
  const { userId, role } = await requireRole(roleCode as RealEstateRole);
  return <GuardedRegistrationsPage currentUserRole={role} currentUserId={userId} />;
}
