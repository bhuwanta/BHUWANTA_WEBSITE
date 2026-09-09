import { requireRole } from '../../_shared/auth';
import NewRegistrationPage from '../../_shared/sales/new-registration/GuardedNewRegistrationPage';

export default async function GMNewRegistrationPage() {
  await requireRole('gm');
  return <NewRegistrationPage />;
}
