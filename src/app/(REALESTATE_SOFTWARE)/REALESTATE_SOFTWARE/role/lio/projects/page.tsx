import { requireRole } from '../../_shared/auth';
import MyProjectsPage from '../../_shared/sales/my-projects/MyProjectsPage';
import PageModuleGuard from '../../_shared/PageModuleGuard';

export default async function LIOProjectsPage() {
  await requireRole('lio');
  return (
    <PageModuleGuard moduleKey="my_projects">
      <MyProjectsPage />
    </PageModuleGuard>
  );
}
