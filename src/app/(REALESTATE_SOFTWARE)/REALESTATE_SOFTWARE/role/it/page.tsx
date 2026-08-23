import { requireRole } from '../_shared/auth';
import AdminDashboard from '../_shared/admin/dashboard/AdminDashboard';

export default async function ITDashboardPage() {
  const { userId, role } = await requireRole('it');
  return <AdminDashboard currentUserRole={role} currentUserId={userId} />;
}
