import { requireRole } from '../../_shared/auth';
import AreasProjectsPage from '../../_shared/admin/areas-projects/AreasProjectsPage';
import PageModuleGuard from '../../_shared/PageModuleGuard';

export default async function CoreAreasProjectsPage() {
  await requireRole('core');
  return (
    <PageModuleGuard moduleKey="areas_projects">
      <AreasProjectsPage />
    </PageModuleGuard>
  );
}
