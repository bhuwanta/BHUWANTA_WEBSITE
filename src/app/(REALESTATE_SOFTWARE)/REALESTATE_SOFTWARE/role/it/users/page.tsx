import { requireRole } from '../../_shared/auth';
import UserManagementModule from '../../_shared/user-management/UserManagementModule';

export default async function ITUsersPage() {
  const { userId, role } = await requireRole('it');
  return <UserManagementModule currentUserRole={role} currentUserId={userId} />;
}
