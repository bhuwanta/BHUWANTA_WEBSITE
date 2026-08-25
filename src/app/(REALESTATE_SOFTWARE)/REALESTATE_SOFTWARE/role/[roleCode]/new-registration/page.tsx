import { requireRole } from '../../_shared/auth';
import NewRegistrationPage from '../../_shared/sales/new-registration/NewRegistrationPage';
import type { RealEstateRole } from '../../_shared/permissions';

export default async function DynamicRoleNewRegistrationPage({ params }: { params: Promise<{ roleCode: string }> }) {
  const { roleCode } = await params;
  await requireRole(roleCode as RealEstateRole);
  return <NewRegistrationPage />;
}
