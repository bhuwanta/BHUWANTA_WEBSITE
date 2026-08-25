import { requireRole } from '../../_shared/auth';
import SelfSettingsPage from '../../_shared/sales/settings/SelfSettingsPage';
import type { RealEstateRole } from '../../_shared/permissions';

export default async function DynamicRoleSettingsPage({ params }: { params: Promise<{ roleCode: string }> }) {
  const { roleCode } = await params;
  await requireRole(roleCode as RealEstateRole);
  return <SelfSettingsPage />;
}
