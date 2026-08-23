import { requireRole } from '../../_shared/auth';
import ModulesPage from '../../_shared/admin/modules/ModulesPage';

export default async function ITModulesPage() {
  await requireRole('it');
  return <ModulesPage />;
}
