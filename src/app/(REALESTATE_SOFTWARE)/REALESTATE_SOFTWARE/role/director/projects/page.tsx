import { requireRole } from '../../_shared/auth';
import MyProjectsPage from '../../_shared/sales/my-projects/MyProjectsPage';
import PageModuleGuard from '../../_shared/PageModuleGuard';

export default async function DirectorProjectsPage() {
  await requireRole('director');
  return (
    <PageModuleGuard moduleKey="my_projects">
      <MyProjectsPage />
    </PageModuleGuard>
  );
}
