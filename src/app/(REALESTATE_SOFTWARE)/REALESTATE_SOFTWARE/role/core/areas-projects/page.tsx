import { requireRole } from '../../_shared/auth';
import AreasProjectsPage from '../../_shared/admin/areas-projects/AreasProjectsPage';

export default async function CoreAreasProjectsPage() {
  await requireRole('core');
  return <AreasProjectsPage />;
}
