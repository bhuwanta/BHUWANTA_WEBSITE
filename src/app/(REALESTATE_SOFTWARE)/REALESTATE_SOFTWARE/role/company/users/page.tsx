import { requireRole } from '../../_shared/auth';
import UserManagementModule from '../../_shared/user-management/UserManagementModule';

export default async function CompanyUsersPage() {
  const { userId, role } = await requireRole('company');
  return <UserManagementModule currentUserRole={role} currentUserId={userId} />;
}
