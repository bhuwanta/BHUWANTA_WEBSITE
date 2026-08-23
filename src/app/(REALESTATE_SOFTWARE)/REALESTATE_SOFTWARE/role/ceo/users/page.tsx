import { requireRole } from '../../_shared/auth';
import UserManagementModule from '../../_shared/user-management/UserManagementModule';

export default async function CEOUsersPage() {
  const { userId, role } = await requireRole('ceo');
  return <UserManagementModule currentUserRole={role} currentUserId={userId} />;
}
