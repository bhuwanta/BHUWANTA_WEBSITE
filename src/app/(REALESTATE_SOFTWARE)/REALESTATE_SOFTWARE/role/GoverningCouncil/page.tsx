import { requireRole } from '../_shared/auth';
import AdminDashboard from '../_shared/admin/dashboard/AdminDashboard';

export default async function GoverningCouncilDashboardPage() {
  const { userId, role } = await requireRole('governing_council');
  return <AdminDashboard currentUserRole={role} currentUserId={userId} />;
}
