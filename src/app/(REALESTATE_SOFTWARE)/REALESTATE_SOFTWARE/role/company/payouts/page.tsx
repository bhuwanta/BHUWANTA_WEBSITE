import { requireRole } from '../../_shared/auth';
import PayoutsPage from '../../_shared/admin/payouts/PayoutsPage';

export default async function CompanyPayoutsPage() {
  await requireRole('company');
  return <PayoutsPage />;
}
