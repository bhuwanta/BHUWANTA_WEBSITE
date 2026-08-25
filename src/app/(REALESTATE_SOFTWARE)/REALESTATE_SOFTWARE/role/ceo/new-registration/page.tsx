import { requireRole } from '../../_shared/auth';
import NewRegistrationPage from '../../_shared/sales/new-registration/NewRegistrationPage';

export default async function CEONewRegistrationPage() {
  await requireRole('ceo');
  return <NewRegistrationPage />;
}
