import { requireRole } from '../../_shared/auth';
import UserManagementModule from '../../_shared/user-management/UserManagementModule';

export default async function RMUsersPage() {
  const { userId, role } = await requireRole('rm');
  return <UserManagementModule currentUserRole={role} currentUserId={userId} />;
}
