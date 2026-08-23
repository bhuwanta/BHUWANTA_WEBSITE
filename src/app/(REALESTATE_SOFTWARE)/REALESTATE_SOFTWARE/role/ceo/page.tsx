import { requireRole } from '../_shared/auth';
import AdminDashboard from '../_shared/admin/dashboard/AdminDashboard';

export default async function CEODashboardPage() {
  const { userId, role } = await requireRole('ceo');
  return <AdminDashboard currentUserRole={role} currentUserId={userId} />;
}
