import { requireRole } from '../../_shared/auth';
import WalletPage from '../../_shared/wallet/GuardedWalletPage';

export default async function LIAWalletPage() {
  await requireRole('lia');
  return <WalletPage />;
}
