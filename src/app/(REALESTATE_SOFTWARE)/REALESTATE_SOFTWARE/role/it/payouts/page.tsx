import { requireRole } from '../../_shared/auth';
import PayoutsPage from '../../_shared/admin/payouts/PayoutsPage';

export default async function ITPayoutsPage() {
  await requireRole('it');
  return <PayoutsPage currentUserRole="it" />;
}
