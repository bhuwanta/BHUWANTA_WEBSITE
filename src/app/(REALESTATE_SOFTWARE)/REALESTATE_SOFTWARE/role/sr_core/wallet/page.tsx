import { requireRole } from '../../_shared/auth';
import WalletPage from '../../_shared/wallet/GuardedWalletPage';

export default async function SrCoreWalletPage() {
  await requireRole('sr_core');
  return <WalletPage />;
}
