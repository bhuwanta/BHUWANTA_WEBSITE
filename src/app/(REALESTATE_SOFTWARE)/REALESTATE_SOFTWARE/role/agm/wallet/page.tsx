import { requireRole } from '../../_shared/auth';
import WalletPage from '../../_shared/wallet/WalletPage';

export default async function AGMWalletPage() {
  await requireRole('agm');
  return <WalletPage />;
}
