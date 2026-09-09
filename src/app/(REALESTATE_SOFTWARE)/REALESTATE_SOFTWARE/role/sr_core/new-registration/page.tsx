import { requireRole } from '../../_shared/auth';
import NewRegistrationPage from '../../_shared/sales/new-registration/GuardedNewRegistrationPage';

export default async function SrCoreNewRegistrationPage() {
  await requireRole('sr_core');
  return <NewRegistrationPage />;
}
