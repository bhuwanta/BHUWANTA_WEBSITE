import { requireRole } from '../../_shared/auth';
import NewRegistrationPage from '../../_shared/sales/new-registration/NewRegistrationPage';

export default async function RMNewRegistrationPage() {
  await requireRole('rm');
  return <NewRegistrationPage />;
}
