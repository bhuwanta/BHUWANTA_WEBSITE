import { requireRole } from '../../_shared/auth';
import NewRegistrationPage from '../../_shared/sales/new-registration/GuardedNewRegistrationPage';

export default async function CoreNewRegistrationPage() {
  await requireRole('core');
  return <NewRegistrationPage />;
}
