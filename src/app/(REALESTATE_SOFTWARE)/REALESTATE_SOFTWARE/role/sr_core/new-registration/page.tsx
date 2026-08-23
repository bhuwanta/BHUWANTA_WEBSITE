import { requireRole } from '../../_shared/auth';
import NewRegistrationPage from '../../_shared/sales/new-registration/NewRegistrationPage';

export default async function SrCoreNewRegistrationPage() {
  await requireRole('sr_core');
  return <NewRegistrationPage />;
}
