import { requireRole } from '../../_shared/auth';
import WalletPage from '../../_shared/wallet/WalletPage';

export default async function CEOWalletPage() {
  await requireRole('ceo');
  return <WalletPage />;
}
