import { requireRole } from '../../_shared/auth';
import MyProjectsPage from '../../_shared/sales/my-projects/MyProjectsPage';

export default async function SrCoreProjectsPage() {
  await requireRole('sr_core');
  return <MyProjectsPage />;
}
