import { requireRole } from '../../_shared/auth';
import AreasProjectsPage from '../../_shared/admin/areas-projects/AreasProjectsPage';

export default async function GoverningCouncilAreasProjectsPage() {
  await requireRole('governing_council');
  return <AreasProjectsPage />;
}
