import { requireRole } from '../../_shared/auth';
import WalletPage from '../../_shared/wallet/GuardedWalletPage';
import type { RealEstateRole } from '../../_shared/permissions';

export default async function DynamicRoleWalletPage({ params }: { params: Promise<{ roleCode: string }> }) {
  const { roleCode } = await params;
  await requireRole(roleCode as RealEstateRole);
  return <WalletPage />;
}
