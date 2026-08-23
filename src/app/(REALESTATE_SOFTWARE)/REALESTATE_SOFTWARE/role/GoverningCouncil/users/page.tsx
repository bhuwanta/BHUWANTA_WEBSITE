import { requireRole } from '../../_shared/auth';
import UserManagementModule from '../../_shared/user-management/UserManagementModule';

export default async function GoverningCouncilUsersPage() {
  const { userId, role } = await requireRole('governing_council');
  return <UserManagementModule currentUserRole={role} currentUserId={userId} />;
}
