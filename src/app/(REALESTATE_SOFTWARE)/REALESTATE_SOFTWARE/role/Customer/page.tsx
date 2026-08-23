import { requireRole } from '../_shared/auth';
import CustomerDashboard from '../_shared/customer/CustomerDashboard';

export default async function CustomerDashboardPage() {
  await requireRole('customer');
  return <CustomerDashboard />;
}
