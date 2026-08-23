import { requireRole } from '../../_shared/auth';
import UserManagementModule from '../../_shared/user-management/UserManagementModule';

export default async function SrCoreUsersPage() {
  const { userId, role } = await requireRole('sr_core');
  return <UserManagementModule currentUserRole={role} currentUserId={userId} />;
}
