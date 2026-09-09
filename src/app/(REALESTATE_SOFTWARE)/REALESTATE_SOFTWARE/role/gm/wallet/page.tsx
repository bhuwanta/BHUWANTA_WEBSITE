import { requireRole } from '../../_shared/auth';
import WalletPage from '../../_shared/wallet/GuardedWalletPage';

export default async function GMWalletPage() {
  await requireRole('gm');
  return <WalletPage />;
}
