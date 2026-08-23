import { requireRole } from '../../_shared/auth';
import MyProjectsPage from '../../_shared/sales/my-projects/MyProjectsPage';

export default async function RMProjectsPage() {
  await requireRole('rm');
  return <MyProjectsPage />;
}
