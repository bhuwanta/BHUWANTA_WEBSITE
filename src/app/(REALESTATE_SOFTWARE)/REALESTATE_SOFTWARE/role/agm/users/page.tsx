import { requireRole } from '../../_shared/auth';
import UserManagementModule from '../../_shared/user-management/UserManagementModule';

export default async function AGMUsersPage() {
  const { userId, role } = await requireRole('agm');
  return <UserManagementModule currentUserRole={role} currentUserId={userId} />;
}
