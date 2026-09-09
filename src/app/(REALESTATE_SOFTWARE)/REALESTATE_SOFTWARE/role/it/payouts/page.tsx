import { requireRole } from '../../_shared/auth';
import PayoutsPage from '../../_shared/admin/payouts/PayoutsPage';
import PageModuleGuard from '../../_shared/PageModuleGuard';

export default async function ITPayoutsPage() {
  await requireRole('it');
  return (
    <PageModuleGuard moduleKey="payouts">
      <PayoutsPage currentUserRole="it" />
    </PageModuleGuard>
  );
}
