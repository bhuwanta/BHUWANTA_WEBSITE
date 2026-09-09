import { requireRole } from '../../_shared/auth';
import PayoutsPage from '../../_shared/admin/payouts/PayoutsPage';
import PageModuleGuard from '../../_shared/PageModuleGuard';

export default async function CEOPayoutsPage() {
  await requireRole('ceo');
  return (
    <PageModuleGuard moduleKey="payouts">
      <PayoutsPage />
    </PageModuleGuard>
  );
}
