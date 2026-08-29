import { requireRole } from '../../_shared/auth';
import AreasProjectsPage from '../../_shared/admin/areas-projects/AreasProjectsPage';
import type { RealEstateRole } from '../../_shared/permissions';

export default async function DynamicRoleAreasProjectsPage({ params }: { params: Promise<{ roleCode: string }> }) {
  const { roleCode } = await params;
  await requireRole(roleCode as RealEstateRole);
  return <AreasProjectsPage />;
}
