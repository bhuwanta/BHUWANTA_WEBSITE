import { requireRole } from '../../_shared/auth';
import UserManagementModule from '../../_shared/user-management/UserManagementModule';

export default async function DirectorUsersPage() {
  const { userId, role } = await requireRole('director');
  return <UserManagementModule currentUserRole={role} currentUserId={userId} />;
}
