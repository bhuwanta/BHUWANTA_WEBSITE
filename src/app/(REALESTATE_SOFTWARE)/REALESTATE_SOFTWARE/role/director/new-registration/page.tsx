import { requireRole } from '../../_shared/auth';
import NewRegistrationPage from '../../_shared/sales/new-registration/GuardedNewRegistrationPage';

export default async function DirectorNewRegistrationPage() {
  await requireRole('director');
  return <NewRegistrationPage />;
}
