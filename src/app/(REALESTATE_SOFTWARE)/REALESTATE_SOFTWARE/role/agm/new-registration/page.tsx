import { requireRole } from '../../_shared/auth';
import NewRegistrationPage from '../../_shared/sales/new-registration/NewRegistrationPage';

export default async function AGMNewRegistrationPage() {
  await requireRole('agm');
  return <NewRegistrationPage />;
}
