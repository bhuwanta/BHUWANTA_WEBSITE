import { requireRole } from '../../_shared/auth';
import UserManagementModule from '../../_shared/user-management/UserManagementModule';

export default async function GMUsersPage() {
  const { userId, role } = await requireRole('gm');
  return <UserManagementModule currentUserRole={role} currentUserId={userId} />;
}
