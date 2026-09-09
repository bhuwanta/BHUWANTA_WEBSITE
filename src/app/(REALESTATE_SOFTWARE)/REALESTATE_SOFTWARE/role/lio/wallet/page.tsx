import { requireRole } from '../../_shared/auth';
import WalletPage from '../../_shared/wallet/GuardedWalletPage';

export default async function LIOWalletPage() {
  await requireRole('lio');
  return <WalletPage />;
}
