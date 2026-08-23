import { requireRole } from '../../_shared/auth';
import MyProjectsPage from '../../_shared/sales/my-projects/MyProjectsPage';

export default async function DirectorProjectsPage() {
  await requireRole('director');
  return <MyProjectsPage />;
}
