import { requireRole } from '../../_shared/auth';
import CommissionRatesPage from '../../_shared/admin/commission-rates/CommissionRatesPage';

export default async function CompanyCommissionRatesPage() {
  await requireRole('company');
  return <CommissionRatesPage />;
}
