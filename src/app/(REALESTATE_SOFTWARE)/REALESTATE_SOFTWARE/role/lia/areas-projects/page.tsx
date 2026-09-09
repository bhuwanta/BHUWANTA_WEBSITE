import { requireRole } from '../../_shared/auth';
import AreasProjectsPage from '../../_shared/admin/areas-projects/AreasProjectsPage';
import PageModuleGuard from '../../_shared/PageModuleGuard';

export default async function LIAAreasProjectsPage() {
  await requireRole('lia');
  return (
    <PageModuleGuard moduleKey="areas_projects">
      <AreasProjectsPage />
    </PageModuleGuard>
  );
}
