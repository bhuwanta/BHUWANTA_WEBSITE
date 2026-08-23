import { requireRole } from '../../_shared/auth';
import PaymentPage from '../../_shared/customer/PaymentPage';

export default async function CustomerPaymentPage() {
  await requireRole('customer');
  return <PaymentPage />;
}
