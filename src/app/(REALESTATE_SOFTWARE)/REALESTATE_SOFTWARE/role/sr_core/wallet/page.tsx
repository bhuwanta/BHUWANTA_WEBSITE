import { requireRole } from '../../_shared/auth';
import WalletPage from '../../_shared/wallet/WalletPage';

export default async function SrCoreWalletPage() {
  await requireRole('sr_core');
  return <WalletPage />;
}
