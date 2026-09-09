import { requireRole } from '../../_shared/auth';
import AreasProjectsPage from '../../_shared/admin/areas-projects/AreasProjectsPage';
import PageModuleGuard from '../../_shared/PageModuleGuard';

export default async function GMAreasProjectsPage() {
  await requireRole('gm');
  return (
    <PageModuleGuard moduleKey="areas_projects">
      <AreasProjectsPage />
    </PageModuleGuard>
  );
}
