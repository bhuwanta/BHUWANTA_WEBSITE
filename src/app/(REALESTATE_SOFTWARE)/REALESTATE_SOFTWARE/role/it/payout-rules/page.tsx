import { requireRole } from '../../_shared/auth';
import PayoutRulesPage from '../../_shared/admin/payout-rules/PayoutRulesPage';

export default async function ITPayoutRulesPage() {
  await requireRole('it');
  return <PayoutRulesPage />;
}
