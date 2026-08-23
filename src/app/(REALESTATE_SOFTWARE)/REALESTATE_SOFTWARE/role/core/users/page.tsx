import { requireRole } from '../../_shared/auth';
import UserManagementModule from '../../_shared/user-management/UserManagementModule';

export default async function CoreUsersPage() {
  const { userId, role } = await requireRole('core');
  return <UserManagementModule currentUserRole={role} currentUserId={userId} />;
}
