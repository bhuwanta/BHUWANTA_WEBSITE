import { requireRole } from '../_shared/auth';
import AdminDashboard from '../_shared/admin/dashboard/AdminDashboard';

export default async function CompanyDashboardPage() {
  const { userId, role } = await requireRole('company');
  return <AdminDashboard currentUserRole={role} currentUserId={userId} />;
}
