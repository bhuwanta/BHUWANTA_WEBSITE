import { requireRole } from '../../_shared/auth';
import PaymentPage from '../../_shared/customer/PaymentPage';
import PageModuleGuard from '../../_shared/PageModuleGuard';

export default async function CustomerPaymentPage() {
  await requireRole('customer');
  return (
    <PageModuleGuard moduleKey="customer_payment">
      <PaymentPage />
    </PageModuleGuard>
  );
}
