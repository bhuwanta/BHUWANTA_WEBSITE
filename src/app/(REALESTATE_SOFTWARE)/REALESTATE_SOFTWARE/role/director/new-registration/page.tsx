import { requireRole } from '../../_shared/auth';
import NewRegistrationPage from '../../_shared/sales/new-registration/NewRegistrationPage';

export default async function DirectorNewRegistrationPage() {
  await requireRole('director');
  return <NewRegistrationPage />;
}
