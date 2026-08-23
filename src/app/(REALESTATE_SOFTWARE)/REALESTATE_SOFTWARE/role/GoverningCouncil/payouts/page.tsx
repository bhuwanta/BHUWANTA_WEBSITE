import { requireRole } from '../../_shared/auth';
import PayoutsPage from '../../_shared/admin/payouts/PayoutsPage';

export default async function GoverningCouncilPayoutsPage() {
  await requireRole('governing_council');
  return <PayoutsPage />;
}
