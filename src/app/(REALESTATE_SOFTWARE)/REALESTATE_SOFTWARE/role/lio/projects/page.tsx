import { requireRole } from '../../_shared/auth';
import MyProjectsPage from '../../_shared/sales/my-projects/MyProjectsPage';

export default async function LIOProjectsPage() {
  await requireRole('lio');
  return <MyProjectsPage />;
}
