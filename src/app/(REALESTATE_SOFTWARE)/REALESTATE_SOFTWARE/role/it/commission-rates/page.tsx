import { requireRole } from '../../_shared/auth';
import CommissionRatesPage from '../../_shared/admin/commission-rates/CommissionRatesPage';

export default async function ITCommissionRatesPage() {
  await requireRole('it');
  return <CommissionRatesPage />;
}
